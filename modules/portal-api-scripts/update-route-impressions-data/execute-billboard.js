//region NPM and Node Packages
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
//endregion

//region Adder Packages (Lazy Initialized)
let CampaignHelper = null;
let Campaign = null;
let Route = null;
//endregion

const MAX_RETRIES = 100;

let ClientFixedPointGeofence = require("adder-models").ClientFixedPointGeofence;
let Geoset = require("adder-models").Geoset;

//region Package Initialization
mongoose.set('useCreateIndex', true);
function initializePackages(modulesDir) {
    const campaignModelPath = path.join(modulesDir, "adder-models");
    const campaignHelperPath = path.join(modulesDir, "campaign-helper");


    Campaign = require(campaignModelPath).Campaign;
    CampaignHelper = require(campaignHelperPath);
    Route = require(campaignModelPath).Route;

   if(Campaign === null) {
        throw new Error("Campaign model could not be loaded (failed null check) from module path " + campaignModelPath);
    } else if(Route === null) {
        throw new Error("Route model could not be loaded (failed null check) from module path " + campaignModelPath);
    } else if(CampaignHelper === null) {
        throw new Error("CampaignHelper could not be loaded (failed null check) from module path " + campaignHelperPath);
    } else if(typeof CampaignHelper.getConversionGeosFromCampaign === "undefined" || CampaignHelper.getConversionGeosFromCampaign === null) {
        throw new Error("CampaignHelper.getConversionGeosFromCampaign could not be loaded (failed null check) from" +
            " module path " + campaignHelperPath);
    }
}
//endregion

//region State Flags
let isProcessing = false;
//endregion

//region Constants
let serverBusyWaitTime = 10000;
//endregion

//region IPC Messaging Helpers
function sendMessage(msg) {
    process.send({
        status: "OK",
        contents: msg
    });
}
function sendError(err) {
    process.send({
        status: "ERR",
        contents: err
    });
}
function sendFatalError(fatalErr) {
    process.send({
        status: "FATAL_ERR",
        contents: fatalErr
    });
    process.exit(-1);
}
function sendCompletionSignal(msg) {
    process.send({
        status: "COMPLETE",
        contents: msg
    });
    process.exit(-1);
}
//endregion

//region IPC Message Handler (Entry Point)
process.on("message", async (msg) => {

    //region Invalid Message Handler
    if(typeof msg === "undefined" || msg === null) {
        return sendError("onMessage event handler fired, but message passed was undefined or null. Ignoring this message.");
    }
    //endregion

    //region Command Message Handler
    if(isProcessing) {
        return sendError("An unrecognized command message (" + JSON.stringify(msg) + ") was received from parent. This" +
            " message will be ignored.");
    }
    //endregion

    isProcessing = true;

    //region Modules Directory Type Check
    if(typeof msg.modulesDir !== "string") {
        return sendFatalError(`Passed message contained an invalid value for msg.modulesDir: ${msg.modulesDir}.`);
    }
    //endregion

    //region ImpressionsDBUrl Type Check
    if(typeof msg.impressionsDBUrl !== "string") {
        return sendFatalError(new Error(`Passed message contained an invalid value for msg.ImpressionsDBUrl: ${msg.ImpressionsDBUrl}.`));
    }
    //endregion

    //region Begin Execution
    try {
        await execute(msg);
    } catch(err) {
        return sendFatalError(new Error(`A fatal error has occurred while attempting to process route updates for billboards:\n${err.stack}`));
    }
    //endregion
});
//endregion

async function execute(params) {
    sendMessage("Execution has begun.");

    let campaigns = [];

    //region Initialize Adder Packages
    try {
        initializePackages(params.modulesDir);
    } catch(err) {
        sendFatalError("initializePackages threw an error while processing. The error was: " + err.toString() +
            ". Processing cannot continue.");
    }
    //endregion

    //region Gather Campaigns With Null Checks
    sendMessage("Gathering Campaigns.");
    try {
        campaigns = await Campaign.find({is_active: true, campaign_archetype: "Billboard"});
    } catch(err) {
        sendFatalError("Failed to retrieve active billboard campaigns. Error was: " + err.toString() + ".");
    }
    if(!Array.isArray(campaigns) || campaigns.length === 0) {
        sendFatalError("Campaign retrieval completed successfully, but no campaigns could be retrieved. Aborting" +
            " execution.");
    }
    sendMessage(`Campaign gathering has completed. Found ${campaigns.length} campaigns to process.`);
    //endregion

    //region Process Each Campaign Separately
    for(let campaign of campaigns) {
        try {
            await processCampaign(params, campaign)
        } catch(err) {
            sendError(`An error occurred while attempting to gather conversion geofences from campaign ${campaign._id}.` +
                     ` The error was: ${err.toString()}. This is not a fatal error, but further execution for this campaign` +
                     ` will not continue`);
        }
    }
    //endregion

    //region Cleanup
    sendMessage("Beginning process cleanup and preparing for termination.");
    try {
        await mongoose.disconnect();
    } catch(err) {
        sendError("An error occurred while awaiting mongoose disconnect. The error was: " + err.toString() + ". This" +
            " may or may not indicate a fatal error. Please check logs and take corrective action. Forcing process" +
            " shutdown.");
        process.exit(-1);
    }

    sendCompletionSignal("Script has successfully completed. Sending completion signal to parent and shutting down.");
    //endregion
}

async function processCampaign(params, campaign) {
    const MSG_PREFIX = `Campaign ${campaign._id})`;
    let conversionTargets;
    let routes;

    let geosets = [];
    let billboardCoordinates = [];

    let hull = null;

    //region Gather Geosets
    try {
        for(let id of campaign.geosets) {
            let geoset = await Geoset.findById(id).lean();
            if(geoset === null) {
                throw new Error(`Geoset for id ${id} was null.`);
            }
            geosets.push(geoset);
        }
    } catch(err) {
        throw new Error(`${MSG_PREFIX} An error occurred while attempting to retrieve geosets:\n${err.stack}`);
    }
    //endregion

    //region Gather Billboards
    try {
        for(let geoset of geosets) {
            for(let id of geoset.billboards) {
                let billboard = await ClientFixedPointGeofence.findById(id, {"geometry.coordinates": 1}).lean();
                if(billboard === null) {
                    throw new Error(`Billboard for id ${id} was null.`);
                }
                billboardCoordinates.push({
                    latitude: billboard.geometry.coordinates[0][0][1],
                    longitude: billboard.geometry.coordinates[0][0][0]
                });
            }
        }
    } catch(err) {
        throw new Error(`${MSG_PREFIX} An error occurred while attempting to retrieve billboards:\n${err.stack}`);
    }
    if(billboardCoordinates.length === 0) {
        throw new Error(`${MSG_PREFIX} Billboard coordinate retrieval was successful, but no coordinates were able to be processed.`);
    }
    //endregion

    //region Gather Conversion Geofences
    try {
        conversionTargets = await gatherConversionGeofences(params, campaign);
    } catch(err) {
        throw new Error(`${MSG_PREFIX} An error occurred while attempting to retrieve conversion targets:\n${err.stack}`);
    }
    //endregion

    //region Gather Routes
    sendMessage(`${MSG_PREFIX} Beginning route retrieval.`);
    try {
        routes = await gatherRoutes(campaign);
    } catch(err) {
        throw new Error(`${MSG_PREFIX} An error occurred while attempting to retrieve routes. Error was: ${err.toString()}.` +
                        ` No rollback is needed.`);
    }
    sendMessage(`${MSG_PREFIX} Completed route retrieval.`);
    //endregion

    sendMessage(`${MSG_PREFIX} Found ${routes.length} routes that require updating.`);

    //region Reconstruct Route With New Data


    for(let i  = 0; i < routes.length; i++) {
        let retries = 0;
        while(retries < MAX_RETRIES) {
            try {
                await reconstructRoute(params.impressionsDBUrl, conversionTargets, routes[i], hull, campaign._id, billboardCoordinates, params.jwtString);
                break;
            } catch(err) {
                if(err.response === undefined || err.response.status === undefined || err.response.status !== 503) {
                    sendError(`An error occurred while attempting to send update request for route ${routes[i]._id}. This route will not be further processed:\n${err.stack}`);
                    break;
                }

                sendMessage(`(${retries + 1} / ${MAX_RETRIES}) - RID: ${routes[i]._id} - ImpressionsAPI returned 503 - Service Unavailable. This request will be retried in 5 seconds`);

                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 5000)
                });
                retries++;
            }
        }
    }
    //endregion

    sendMessage(`${MSG_PREFIX} all requests have been fired and processCampaign has completed execution.`)
}

async function gatherConversionGeofences(params, campaign) {
    try {
        return await CampaignHelper.getConversionGeosFromCampaign(campaign);
    } catch(err) {
        throw err;
    }
}
async function gatherRoutes(campaign) {
    try {
        let idbCompleteFalseRoutes = await Route.find({"ro.cref": campaign._id, "idb_complete": false}, {ip_data: false, "ro.unique_devices": false});
        let idbDoesNotExistRoutes = await Route.find({"ro.cref": campaign._id, "idb_complete": {$exists: false}}, {ip_data: false, "ro.unique_devices": false});
        return idbCompleteFalseRoutes.concat(idbDoesNotExistRoutes);
    } catch(err) {
        throw err;
    }
}
async function reconstructRoute(apiBaseUrl, conversionTargets, route, hull, cid, billboardPoints, jwtString) {
    sendMessage("Constructing request");
    let cone = {
        _id: route.cones._id,
        type: "Feature",
        properties: {},
        geometry: {
            coordinates: route.cones.geometry.coordinates[0],
            type: "Polygon"
        }
    };
    let data = {
        rid: route._id,
        impressionsDBUrl: apiBaseUrl,
        sts: route.ro.sts,
        ets: route.ro.ets,
        billboard: {
            cone: cone
        },
        hull: hull,
	    cid: cid,
        conversionTargets: conversionTargets,
        billboardPoints: billboardPoints,
        last_updated: route.last_updated,
        jwtString: jwtString
    };

    try {
        await gatherNewStatsFromImpressionsAPI(data);
    } catch(err) {
        throw err;
    }
}
async function gatherNewStatsFromImpressionsAPI(data) {
    sendMessage(`Firing request to: ${data.impressionsDBUrl}`);
    const config = {
        method: "post",
        baseURL: data.impressionsDBUrl,
        timeout: 60000,
        data: {
            billboard: data.billboard,
            conversionTargets: data.conversionTargets,
            rid: data.rid,
            hull: data.hull,
            billboardPoints: data.billboardPoints,
		    cid: data.cid
        },
        params: {
            sts: data.sts,
            ets: data.ets
        },
        headers: {
            Authorization: data.jwtString
        }
    };

    try {
        return await new Promise((resolve, reject) => {
            axios(config).then((response) => {
		sendMessage("Request completed");
                return resolve();
            }).catch((err) => {
		sendError(`Error in completing request:\n${err}`);
                return reject(err);
            });
        });
    } catch(err) {
        throw err;
    }
}

module.exports = null;
