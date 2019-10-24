

require("dotenv").config();

//region NPM and Node Packages
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
//endregion

//region Adder Packages (Lazy Initialized)
let ImpressionsUtility = null;
let ImpressionsAPIRoutes = null;
let CampaignHelper = null;
let Campaign = null;
let Route = null;
//endregion

//region Package Initialization
mongoose.set('useCreateIndex', true);
function initializePackages(modulesDir) {
    const impressionsUtilityPath = path.join(modulesDir, "impressions-api-utility");
    const campaignModelPath = path.join(modulesDir, "adder-models");
    const campaignHelperPath = path.join(modulesDir, "campaign-helper");

    ImpressionsUtility = require(impressionsUtilityPath);
    ImpressionsAPIRoutes = require("impressions-api-utility").Routes.GigEconomy;
    Campaign = require(campaignModelPath).Campaign;
    CampaignHelper = require(campaignHelperPath);
    Route = require(campaignModelPath).Route;

    if(ImpressionsUtility === null) {
        throw new Error("ImpressionsUtility could not be loaded (failed null check) from module path " + impressionsUtilityPath);
    } else if(Campaign === null) {
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

const maxParallelRequests = 3;

//region State Flags
let isProcessing = false;
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
    //region Null Message Handler
    if(typeof msg === "undefined" || msg === null) {
        sendError("onMessage event handler fired, but message passed was undefined or null. Ignoring this message.");
        return;
    }
    //endregion

    //region Command Message Handler
    if(isProcessing) {
        sendError("An unrecognized command message (" + JSON.stringify(msg) + ") was received from parent. This" +
            " message will be ignored.");
        return;
    }
    //endregion

    isProcessing = true;

    //region Modules Directory Type Check
    if(typeof msg.modulesDir !== "string") {
        sendFatalError("Passed message " + JSON.stringify(msg) + " contained an invalid value for msg.modulesDir." +
            " Processing cannot continue.");
        return;
    }
    //endregion

    //region ImpressionsDBUrl Type Check
    if(typeof msg.impressionsDBUrl !== "string") {
        sendFatalError("Passed message " + JSON.stringify(msg) + " contained an invalid value for" +
            " msg.ImpressionsDBUrl. Processing cannot continue.");
        return;
    }
    //endregion

    //region (NORMAL) Campaign Archetype Type Check
    if(typeof msg.campaignType === "undefined" || msg.campaignType === null) {
        sendFatalError("Passed message " + JSON.stringify(msg) + " contained no value for msg.campaignType." +
            " Processing cannot continue.");
        return;
    }
    if(msg.campaignType !== "Advantage" && msg.campaignType !== "Fleet") {
        sendFatalError("Passed msg.campaignType " + msg.campaignType + " is invalid. Campaign type must be \"Fleet\"" +
            " or \"Advantage\"");
        return;
    }
    //endregion

    //region Begin Execution
    sendMessage("Beginning execution.");
    await execute(msg);
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
        campaigns = await Campaign.find({is_active: true, campaign_archetype: params.campaignType});
    } catch(err) {
        sendFatalError(`Failed to retrieve active ${params.campaignType.toLowerCase()} campaigns. Error was: ${err.toString()}.`);
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
            sendError(`An error occurred while attempting to process campaign ${campaign._id}.` +
                ` The error was: ${err.stack}. This is not a fatal error, but further execution for this campaign` +
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
    const MSG_PREFIX = `For campaign ${campaign._id},`;
    let conversionTargets;
    let routes;
    let reconstructedRoutes;

    //region Gather Conversion Geofences
    sendMessage(`${MSG_PREFIX} Beginning conversion geofence gathering.`);
    try {
        conversionTargets = await gatherConversionGeofences(params, campaign);
    } catch(err) {
        sendError(`${MSG_PREFIX} An error occurred while attempting to retrieve conversion targets. Processing will` +
        ` continue, but conversions will not be calculated. Error was: ${err.toString()}`);
        conversionTargets = [];
    }

    if(conversionTargets.length === 0) {
        sendMessage(`${MSG_PREFIX} Conversion geofence retrieval completed successfully, but no conversion targets` +
        ` were found. This may indicate a problem with the database. Processing will continue, but no conversion data will` +
        ` be processed.`);
    } else {
        sendMessage(`${MSG_PREFIX} Completed conversion geofence gathering. Found ${conversionTargets.length} conversion targets.`);
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
    if(routes.length === 0) {
        sendMessage(`${MSG_PREFIX} No routes could be found, so further processing is unnecessary. Returning.`);
        return;
    }
    sendMessage(`${MSG_PREFIX} Completed route retrieval. Found ${routes.length} routes to process.`);
    //endregion

    //region Create Base Params Object For Request
    let requestParams = {
        campaignID: campaign._id,
        impressionsDBUrl: params.impressionsDBUrl,
        conversionTargets: conversionTargets,
        jwtString: params.jwtString
    };
    //endregion

    let workingRoutes = [];

    for(let route of routes) {
        workingRoutes.push(route);
        if(workingRoutes.length >= maxParallelRequests) {
            sendMessage(`Working routes count has exceeded maxParallelRequests of ${maxParallelRequests}. Resolving array.`);
            await processRouteArray(workingRoutes, requestParams);
            workingRoutes = [];
            sendMessage(`Finished resolving request promise array. Continuing.`);
        }
    }

    if(workingRoutes.length > 0) {
        sendMessage(`Finishing last promise array.`);
        await processRouteArray(workingRoutes, requestParams);
        sendMessage(`Last promise array has completed.`);
    }


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
        let idbCompleteFalseRoutes = await Route.find({"ro.cref": campaign._id, "idb_complete": false});
        let idbDoesNotExistRoutes = await Route.find({"ro.cref": campaign._id, "idb_complete": {$exists: false}});
        return idbCompleteFalseRoutes.concat(idbDoesNotExistRoutes);
    } catch(err) {
        throw err;
    }
}
async function processRouteArray(routes, requestParams) {
    const MSG_PREFIX = `For campaign ${requestParams.campaignID},`;

    sendMessage(`${MSG_PREFIX} sending route requests.`);

    let pendingPromises = [];
    for(let route of routes) {
        const params = {
            MSG_PREFIX: `${MSG_PREFIX} ${route._id},`,
            rid: route._id,
            impressionsDBUrl: requestParams.impressionsDBUrl,
            conversionTargets: requestParams.conversionTargets,
            jwtString: requestParams.jwtString
        };
        pendingPromises.push(gatherNewStatsFromImpressionsAPI(params, route));
    }

    sendMessage(`Constructed ${pendingPromises.length} update requests. Beginning resolve period.`);

    for(let promise of pendingPromises) {
        try {
            sendMessage(`Awaiting update request promise.`);
            let result = await promise;
            sendMessage(`Processing request for route ${result.rid} has returned successfully.`);
        } catch(err) {
            sendError(err.stack);
        }
    }

    sendMessage(`All update requests have completed.`);
}

let retries = 0;
let serverBusyWaitTime = 10000;

async function gatherNewStatsFromImpressionsAPI(params, route) {
    const config = {
        method: "post",
        baseURL: params.impressionsDBUrl,
        timeout: 60000,
        headers: {
            "Authorization": params.jwtString
        },
        data: {
            rid: route._id,
            route: route,
            conversionTargets: params.conversionTargets
        }
    };

    sendMessage(`Firing request for route ${route._id}`);
    return await new Promise((resolve, reject) => {
        axios(config).then((response) => {
            retries = 0;
            serverBusyWaitTime = 5000;
            sendMessage(`Request for route ${route._id} has successfully completed.`);
            return resolve({
                rid: route._id
            });
        }).catch(async (err) => {
            if(err.response !== undefined && err.response.status !== undefined && err.response.status !== 503) {
                return reject(new Error(`A fatal error occurred while attempting to send parameters for new route to Impressions API: ${err.stack}`));
            } else if(retries > 100) {
                return reject(new Error(`Request retried ${retries} times, but backoff limit has been reached. No further routes will be processed.`));
            }

            retries++;
            if(retries % 3 === 0) {
                serverBusyWaitTime *= 1.5;
            }
            sendMessage(`ImpressionsAPI is currently unavailable. Beginning backoff-retry. (${route._id} | ${retries} | ${serverBusyWaitTime})`);

            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, serverBusyWaitTime)
            });

            return resolve(await gatherNewStatsFromImpressionsAPI(params, route));
        });
    });
}

module.exports = null;