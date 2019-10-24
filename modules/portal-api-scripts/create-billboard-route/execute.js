//region NPM Modules
const mongoose = require("mongoose");
const axios = require("axios");
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const Regex = require("node-common-utility").Regex;
const Stopwatch = require("node-common-utility").Profiling.Stopwatch;
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const Campaign = require("adder-models").Campaign;
const Geofence = require("adder-models").ClientGeofence;
const Geoset = require("adder-models").Geoset;
const ClientFixedPointGeofence = require("adder-models").ClientFixedPointGeofence;
const ImpressionAPIHelper = require("impressions-api-utility").Routes;
const Billboard = require("adder-models").Billboard;
//endregion

//region Execution Parameters
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 100;
const RETRY_WAIT = 5000;
//endregion

//region Other Stuff
mongoose.set('useCreateIndex', true);
const ImpressionsDBUrl = ImpressionAPIHelper.Host + ImpressionAPIHelper.Billboard.updateBillboardRoute;
let logger;
//endregion

console.log(ImpressionsDBUrl)

process.on("message", async (msg) => {
    //region Verify All Parameters Passed
    if(msg.startTimestamp === undefined || msg.startTimestamp === null) {
        return handleFatalError(new Error(`Passed parameters did not contain startTimestamp field.`));
    } else if(msg.endTimestamp === undefined || msg.endTimestamp === null) {
        return handleFatalError(new Error(`Passed parameters did not contain endTimestamp field.`));
    } else if(msg.campaignID === undefined || msg.campaignID === null) {
        return handleFatalError(new Error(`Passed parameters did not contain campaignID field.`));
    }
    //endregion

    //region Verify All Parameters Valid
    if (!Regex.utcSecondsRegex.test(msg.startTimestamp)) {
        return handleFatalError(new Error(`Starting timestamp ${msg.startTimestamp} failed regex test.`));
    } else if (!Regex.utcSecondsRegex.test(msg.endTimestamp)) {
        return handleFatalError(new Error(`Ending timestamp ${msg.endTimestamp} failed regex test.`));
    } else if (!Regex.mongoDBObjectIDRegex.test(msg.campaignID)) {
        return handleFatalError(new Error(`Campaign ID ${msg.campaignID} failed regex test.`));
    }
    //endregion

    //region Initialize Logger
    logger = new ImmutableTagLogger(`create-billboard-route<execute.js - ${msg.campaignID}>`);
    //endregion

    // noinspection MagicNumberJS
    logger.debug(`Beginning campaign processing with parameters: CampaignID - ${msg.campaignID} | ` +
                 `StartTimestamp - ${msg.startTimestamp}(${new Date(msg.startTimestamp * 1000).toISOString()}) | ` +
                 `EndTimestamp - ${msg.endTimestamp}(${new Date(msg.endTimestamp * 1000).toISOString()})`);

    //region Main Execution
    try {
        await processCampaign(Number(msg.startTimestamp), Number(msg.endTimestamp), String(msg.campaignID), String(msg.jwtString));
        await mongoose.disconnect();
        process.send("DONE");
	process.exit(0);
    } catch(err) {
        await mongoose.disconnect();
        return handleFatalError(err);
    }
    //endregion
});
function handleFatalError(err) {
    let message = `A fatal error has occurred. Execution will halt:\n${err.stack}`;
    if (logger) {
        logger.error(message);
    } else {
        console.error(message);
    }
    process.send("DONE");
    process.exit(1);
}
async function processCampaign(startTimestamp, endTimestamp, campaignID, jwtString) {

    const execStopwatch = new Stopwatch();
    const stopwatch = new Stopwatch();

    let campaign = null;
    let geosets = [];
    let billboardIDs = [];
    let conversionTargetIDs = [];
    let billboards = [];
    let billboardCoordinates = [];
    let conversionTargets = [];
    let hull = null;
    let totalRetries = 0;

    execStopwatch.start();
    logger.info("Beginning execution");

    //region Retrieve Campaigns
    try {
        stopwatch.start();
        // noinspection JSUnresolvedFunction
        campaign = await Campaign.findById(campaignID);

        if (campaign === null) {
            throw new Error(`Campaign retrieval completed successfully, but campaign ${campaignID} could not be found.`);
        }

        stopwatch.stop();
        logger.info(`Campaign Retrieval: Runtime - ${stopwatch.getRuntime("ms")}ms.`);
    } catch (err) {
        return handleFatalError(new Error(`A fatal error occurred while retrieving campaign:\n${err.stack}`));
    }
    //endregion

    //region Retrieve Geosets
    try {
        stopwatch.start();
        for (let gid of campaign.geosets) {
            let geoset = await Geoset.findById(gid, {billboards: 1, conv_geos: 1}).lean();

            if (geoset === null) {
                throw new Error(`Geoset retrieval completed successfully, but geoset ${gid} could not be found.`);
            }

            geosets.push(geoset);
        }

        if (geosets.length === 0) {
            throw new Error(`Geoset retrieval completed successfully, but no geosets were returned.`);
        }

        stopwatch.stop();
        logger.info(`Geoset Retrieval: Runtime - ${stopwatch.getRuntime("ms")}ms | Count - ${geosets.length}`);
    } catch(err) {
        return handleFatalError(new Error(`A fatal error occurred while retrieving geosets:\n${err.stack}`));
    }
    //endregion

    //region Initialize ID Arrays (Keeps the Code Easier To Read)
    for(let geoset of geosets) {
        billboardIDs = billboardIDs.concat(geoset.billboards);
        conversionTargetIDs = conversionTargetIDs.concat(geoset.conv_geos);
    }
    //endregion

    //region Retrieve Billboards and Cones
    try {
        stopwatch.start();
        for (let id of billboardIDs) {
            // noinspection JSUnresolvedFunction
            let billboard = await Billboard.findById(id).lean();
            if (billboard === null) {
                throw new Error(`Billboard retrieval completed successfully, but billboard ${id} could not be found.`);
            }

            billboard.cone = {
                _id: billboard._id,
                type: "Feature",
                properties: {
                    asset_name: billboard.properties.asset_name,
                    base_point: billboard.geometry.coordinates.slice(0)[0],
                },
                geometry: {
                    type: "Polygon",
                    coordinates: billboard.geometry.coordinates.slice(0)
                }
            };
            billboards.push(billboard);
        }
        if (billboards.length === 0) {
            throw new Error(`Billboard retrieval completed successfully, but no billboards could be found.`);
        }
        stopwatch.stop();
        logger.info(`Billboard and Cone Retrieval: Runtime - ${stopwatch.getRuntime("ms")}ms | Count - ${billboards.length}`);
    } catch (err) {
        return handleFatalError(new Error(`A fatal error occurred while retrieving billboards and cones:\n${err.stack}`));
    }
    //endregion

    //region Gather Conversion Targets
    try {
        stopwatch.start();
        for (let id of conversionTargetIDs) {
            // noinspection JSUnresolvedFunction
            let conversionTarget = await Geofence.findById(id).lean();
            if (conversionTarget === null) {
                throw new Error(`Conversion target retrieval completed successfully, but target ${id} could not be found.`);
            }
            conversionTargets.push(conversionTarget);
        }
        if (conversionTargets.length === 0) {
            throw new Error(`Conversion target retrieval completed successfully, but no targets could be found.`);
        }
        stopwatch.stop();
        logger.info(`ConversionTargetRetrieval: Runtime - ${stopwatch.getRuntime("ms")}ms | Count - ${conversionTargets.length}`);
    } catch(err) {
        return handleFatalError(new Error(`A fatal error occurred while retrieving conversion targets:\n${err.stack}`));
    }
    //endregion

    //region Populate Billboard Coordinates Array
    try {
        stopwatch.start();
        for(let billboard of billboards) {
         let coordinate = {
		latitude: billboard.geometry.coordinates[0][0][1],
		longitude: billboard.geometry.coordinates[0][0][0]
	 };
	//	console.log(coordinate)
	billboardCoordinates.push(coordinate);
        }
        if (billboardCoordinates.length === 0) {
            throw new Error(`Billboard coordinate retrieval was successful, but no coordinates were able to be processed.`);
        }
        stopwatch.stop();
        logger.info(`Billboard Coordinates Array Population: Runtime - ${stopwatch.getRuntime("ms")}ms | Count - ${billboardCoordinates.length}`);
    } catch(err) {
        return handleFatalError(`A fatal error occurred while populating billboard coordinates array:\n${err.stack}`);
    }
    //endregion

    //region Fire the Requests
    stopwatch.start();
    for(let billboard of billboards) {
        let params = {
            campaignID: campaignID,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            conversionTargets: conversionTargets,
            billboard: billboard,
            hull: hull,
            billboardCoordinates: billboardCoordinates
        };

        let retries = 0;
        try {
            let success = false;
            while (retries <= MAX_RETRIES) {
                success = await fireRouteUpdateRequest(params, jwtString);
                if(success) {
                    break;
                }

                logger.info(`ImpressionsAPI is currently busy. Will retry in ${RETRY_WAIT}ms.`);
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, RETRY_WAIT);
                });
                retries++;
            }
            totalRetries += retries;
            if(!success) {
                throw new Error(`Route update request exceeded maximum number of retries.`);
            }
        } catch(err) {
            return handleFatalError(new Error(`A fatal error occurred while attempting to fire request to ImpressionsAPI:\n${err.stack}`));
        }
    }
    stopwatch.stop();
    logger.info(`Route Requests All Sent: Runtime - ${stopwatch.getRuntime("ms")}ms | Total Retries: ${totalRetries}`);
    //endregion

    logger.info("All routes have been successfully processed. Returning.");
}

async function fireRouteUpdateRequest(parameters, jwt) {
    let {campaignID, billboard, conversionTargets, hull, billboardCoordinates, startTimestamp, endTimestamp} = parameters;
    const config = {
        method: "post",
        baseURL: ImpressionsDBUrl,
        timeout: REQUEST_TIMEOUT,
        data: {
            cid: campaignID,
            rid: "NEW",
            billboard: billboard,
            conversionTargets: conversionTargets,
            hull: hull,
            billboardPoints: billboardCoordinates
        },
        params: {
            sts: startTimestamp,
            ets: endTimestamp
        },
        headers: {
            "Authentication": jwt
        }
    };

    try {
        return await new Promise((resolve, reject) => {
            axios(config).then(() => {
                return resolve(true);
            }).catch((err) => {
                if (err.response !== undefined && err.response.status !== undefined && err.response.status === HTTPStatusCodes.SERVICE_UNAVAILABLE) {
                    return resolve(false);
                } else {
                    return reject(err);
                }
            });
        });
    } catch (err) {
        throw err;
    }
}

module.exports = null;
