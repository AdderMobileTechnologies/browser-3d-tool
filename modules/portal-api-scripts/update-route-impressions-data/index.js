/*
    Runner script for updating driver routes impressions data. This is the script that is executed whenever
    this module is included in others, or is directly invoked with node (i.e. using a cronjob).

    Determining If a Route Update is Needed
        By the time a route is sent to the Impressions API, we know for sure that there is some kind of new data in
        the ImpressionsDB that needs to be considered or added to the route. After we receive the impression stats, we
        want to know if we should send that route again on the next scheduled update, or if that route is as up to date
        as it possibly can be. If it's as up to date as it can be, there's no point in sending it again in the future,
        as the results would either return the exact same values, or in a worst case scenario, the corresponding
        collections have been moved to cold storage and the Impressions API would return a 0 for everything.

        To help us with this, the Impressions API has a utility endpoint at /internal/meta/completed_collections that,
        when queried with a GET request, returns a list of collections that are considered "complete" (i.e. there
        is no more data that will be placed into that collection, it is completely up-to-date), as well a list of
        collections that are considered "incomplete" (i.e. there will be new data put into that collection at some
        point in the future). We can use these lists (which are just arrays of strings indicating the UTC timestamp
        at midnight of that day) after the impressions result is returned to allow us to determine how to set the
        "idb_complete" field on the processed route. If all of the collections a route will need to query are in the
        "completeCollections" set, we can consider the route to be as updated as possible, and will set the
        "idb_complete" field to "true". If it is not in that set, then the collections are either not complete, or do
        not exist at all, at which point we set the "idb_complete" field to "false". Any routes with the
        "idb_complete" field set to "false" will then be processed again on the next scheduled update.

        Note that the endpoint returns both complete and incomplete collections, but for the purposes of this script,
        we only need to know the completed collections in order to determine the value of "idb_complete", so we ignore
        the incomplete array that is also returned from the endpoint.

    Brandon Bush
    July 16th, 2019
    Adder Mobile Technologies
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fork = require("child_process").fork;

const TAG = "update-route-impressions-data";

const modulesDir = path.join(process.env.ROOT_DIR, "modules");
const constantsDir = path.join(process.env.ROOT_DIR, "modules", "adder-constants");

const ImpressionsAPIHelper = require("impressions-api-utility");
const billboardUpdateUrl = process.env.IMPRESSIONS_API_HOST + ImpressionsAPIHelper.Routes.Billboard.updateBillboardRoute;
const normalUpdateUrl = ImpressionsAPIHelper.Routes.Host + ImpressionsAPIHelper.Routes.GigEconomy.updateGigEconomyRoute;
const executeBillboardFilepath = path.join(modulesDir, "/portal-api-scripts/update-route-impressions-data/execute-billboard.js");
const executeNormalFilepath = path.join(modulesDir, "/portal-api-scripts/update-route-impressions-data/execute-normal.js");

const Logger = require("node-common-utility").Logging.StaticLogger;

async function main() {

    //region Process Billboard Routes
    Logger.info(TAG, "Beginning billboard campaign processing.");
    try {
        await processBillboardCampaigns();
    } catch(err) {
        Logger.error(TAG, "In main, processBillboardCampaigns rejected with error: " + err.toString() + ". Please review" +
            " logs and take any necessary corrective action.");
    }
    Logger.info(TAG, "Billboard campaign processing has completed.");
    //endregion

    //region Process Fleet Routes
    Logger.info(TAG, "Beginning fleet campaign processing.");
    try {
        await processFleetCampaigns();
    } catch(err) {
        Logger.error(TAG, "In main, processFleetCampaigns rejected with error: " + err.toString() + ". Please review" +
            " logs and take any necessary corrective action.");
    }
    Logger.info(TAG, "Fleet campaign processing has completed.");
    //endregion

    //region Process Gig Economy Routes
    Logger.info(TAG, "Beginning gig economy campaign processing.");
    try {
        await processGigEconomyCampaigns();
    } catch(err) {
        Logger.error(TAG, "In main, processGigEconomyCampaigns rejected with error: " + err.toString() + ". Please" +
            " review logs and take any necessary corrective action.");
    }
    Logger.info(TAG, "Gig economy campaign processing has completed.");
    //endregion

    Logger.info(TAG, "All route update requests have completed.");

    //region Cleanup
    Logger.info(TAG, "Disconnecting mongoose.");
    try {
        await mongoose.disconnect();
    } catch(err) {
        Logger.error(TAG, "An error occurred while attempting to disconnect mongoose from the database. The error" +
            " was: " + err.toString() + ". This may be a fatal error. Please review logs and take any necessary" +
            " corrective action. Forcing process exit.");
        process.exit(-1);
    }
    Logger.info(TAG, "Mongoose has been disconnected.");
    //endregion

    Logger.info(TAG, "Graceful shutdown has been completed. Ending execution. Have a great day!");

    process.exit(-1);
}
async function processFleetCampaigns() {
    await processNormalCampaigns("Fleet");
}
async function processGigEconomyCampaigns() {
    await processNormalCampaigns("Advantage");
}

async function processBillboardCampaigns() {
    Logger.info(TAG, "Handing off control to execute-billboard script. Execution will be handled by this file until" +
        " forked processed is rejoined into main.");

    const child = fork(executeBillboardFilepath);
    await new Promise((resolve, reject) => {
        child.on("message", (msg) => {
            if(msg.status === "OK") {
                Logger.info(TAG + "_execute-billboard", "\t" + msg.contents);
            } else if(msg.status === "COMPLETE") {
                Logger.info(TAG, "Child execute-billboard process has successfully completed" +
                    " with message: " + msg.contents);
                child.kill();
                return resolve();
            } else if(msg.status === "ERR") {
                Logger.warn(TAG, "A non-fatal error of: " + msg.contents + " occurred. Operation will continue but" +
                    " may not process full data set. See logs for more information.");
            } else if(msg.status === "FATAL_ERR") {
                Logger.error(TAG, "Child process has returned a fatal error of: " + msg.content + ". This is a fatal" +
                    " error. Killing child process and returning unsuccessfully.");
                child.kill();
                return reject(new Error("FATAL_ERROR_ENCOUNTERED: " + msg.contents));
            }
        });

        child.send({
            modulesDir: modulesDir,
            impressionsDBUrl: billboardUpdateUrl,
            jwtString: "JWT " + process.env.IMPRESSIONS_API_KEY
        });
    });
}
async function processNormalCampaigns(campaignType) {
    Logger.info(TAG, "Handing off control to execute-normal script. Execution will be handled by this file until" +
        " forked processed is rejoined into main.");

    const child = fork(executeNormalFilepath);
    await new Promise((resolve, reject) => {
        child.on("message", (msg) => {
            if(msg.status === "OK") {
                Logger.info(`${TAG}_execute-normal<${campaignType}>`, "\t" + msg.contents);
            } else if(msg.status === "COMPLETE") {
                Logger.info(TAG, "Child execute-normal process has successfully completed" +
                    " with message: " + msg.contents);
                child.kill();
                return resolve();
            } else if(msg.status === "ERR") {
                Logger.warn(TAG, "A non-fatal error of: " + msg.contents + " occurred. Operation" +
                    " will continue but may not process full data set. See logs for more information.");
            } else if(msg.status === "FATAL_ERR") {
                Logger.error(TAG, "Child process has returned a fatal error of: " + msg.contents + ". This is a fatal" +
                    " error. Killing child process and returning unsuccessfully.");
                child.kill();
                return reject(new Error("FATAL_ERROR_ENCOUNTERED: " + msg.contents));
            }
        });
        child.send({
            modulesDir: modulesDir,
            impressionsDBUrl: normalUpdateUrl,
            campaignType: campaignType,
            jwtString: "JWT " + process.env.IMPRESSIONS_API_KEY
        });
    });
}

main();
