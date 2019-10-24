//region NPM Packages
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fork = require("child_process").fork;
//endregion

//region Arguments
const args = require("minimist")(process.argv.slice(2));
//endregion

//region Local Packages
const UTCRegex = require("node-common-utility").Regex.utcSecondsRegex;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const Campaign = require("adder-models").Campaign;
//endregion

//region File URIs
const executeFileUrl = path.join(__dirname, "execute.js");
//endregion

//region Instantiated Utilities
const logger = new ImmutableTagLogger("create-billboard-route<index.js>");
//endregion

//region Other Stuff
const SECONDS_IN_DAY = 86400;
//endregion

//region Promises
const backgroundProcess = async (startTimestamp, endTimestamp, campaignID) => {
    return new Promise(async (resolve) => {
        const childProcess = fork(executeFileUrl);
        childProcess.on("message", () => {
            return resolve();
        });
        childProcess.send({
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            campaignID: campaignID,
            jwtString: "JWT " + process.env.IMPRESSIONS_API_KEY
        });
    });
};
//endregion

//region Metadata
const LAST_UPDATED = "08/13/2019 11:22 PM";
const VERSION = "1.1.0";
//endregion

async function automaticRun() {
    logger.info("Beginning daily billboard route generation.");

    //region Retrieve Campaigns
    logger.info("Retrieving billboard campaigns.");
    let campaigns = [];
    try {
        campaigns = await Campaign.find({campaign_archetype: "Billboard", is_active: true}, {_id: 1, geosets: 1}).lean();
    } catch(err) {
        logger.error("A " + err.constructor.name + " exception occurred while retrieving billboard campaigns. Err" +
            " was: " + JSON.stringify(err, null, 4));
        logger.error("Aborting execution.");
        await mongoose.disconnect();
        return;
    }

    logger.info("\tRetrieved Count: " + campaigns.length);
    if(campaigns.length === 0) {
        logger.error("Campaign retrieval completed with no error, but no billboard campaigns were retrieved!");
        logger.error("Aborting execution.");
        await mongoose.disconnect();
        return;
    }
    //endregion

    //region Determine Timestamps
    const todayDate = new Date();

    // noinspection MagicNumberJS
    let sts = todayDate.getTime() / 1000;
    sts -= (sts % SECONDS_IN_DAY);
    let ets = sts + (SECONDS_IN_DAY - 1);
    logger.info("\tDetermined STS: " + sts + "(" + sts + ")");
    logger.info("\tDetermined ETS: " + ets + "(" + ets + ")");
    //endregion

    //region Begin Processing
    for (let campaign of campaigns) {
        try {
            await backgroundProcess(sts, ets, campaign._id);
            logger.info("Successfully created routes for campaign " + campaign._id);
        } catch (err) {
            logger.error(`An error occurred while awaiting child process for campaign ${campaign._id} to complete:\n${err.stack}`);
        }
    }

    await mongoose.disconnect();
    logger.info("All campaigns have been processed. Returning.");
}
async function manualRun() {

    let { campaign, client } = args;
    let specificDay = args["specific-day"] || false;

    // Campaign and Client are mutually exclusive modes, so throw if both were specified.
    if (campaign && client || campaign && specificDay || client && specificDay) {
        throw new Error(`--campaign, --client, and --specific-day are mutually exclusive, and cannot be specified together.`);
    }

    // Gotta specify at least one!
    if(!campaign && !client && !specificDay) {
        throw new Error(`Must specify exactly one of --campaign, --client, or --specific-day to run in manual mode.`);
    }

    // Get the arguments
    let argsPackage = constructArguments();

    // Start execution
    if(specificDay) {
        await specificDayRun(argsPackage);
    } else if (campaign) {
        await campaignRun(argsPackage);
    } else {
        await clientRun(argsPackage);
    }
}

function constructArguments() {
    let { id, day } = args;
    let baseTS = -1;
    let endTS;
    let ignoreActiveFlag = args["ignore-is-active"] || false;
    let specificDayFlag = args["specific-day"] || false;

    // --id must be specified for campaign and client mode, but isn't required for specific-day mode
    if (!id && !specificDayFlag) {
        throw new Error(`--id was not specified. Please specify the ObjectID of the campaign to create routes for.`);
    }

    //Figure out what day to make the route for
    if(specificDayFlag) {
	logger.info("--specific-day was specified");
        baseTS = Number(args["specific-day"]);
    } else if (day) {
        if (!UTCRegex.test(day)) {
            throw new Error(`--day was specified, but value ${day} failed regex test.`);
        }
        baseTS = day;
    } else {
        // noinspection MagicNumberJS
        let currentTimeInSeconds = new Date().getTime() / 1000;
        baseTS = currentTimeInSeconds - (currentTimeInSeconds % SECONDS_IN_DAY);
    }

    baseTS -= (baseTS % SECONDS_IN_DAY);
    endTS = baseTS + (SECONDS_IN_DAY - 1);

	logger.info(`Determined STS as ${baseTS}`);
	logger.info(`Determined ETS as ${endTS}`);
    return {
        id: id,
        sts: baseTS,
        ets: endTS,
        ignoreActiveFlag: ignoreActiveFlag,
        specificDayFlag: specificDayFlag
    }
}
async function specificDayRun(argsPackage) {
    let { sts, ets, ignoreActiveFlag } = argsPackage;

    let campaignIDs = [];
    let query = {
        campaign_archetype: "Billboard",
        is_active: true
    };

    if(ignoreActiveFlag) {
        query = {
            campaign_archetype: "Billboard"
        };
    }

    try {
        campaignIDs = (await Campaign.find(query, {_id: 1}).lean()).map((value) => value._id);
    } catch(err) {
        throw new Error(`An error occurred while attempting to retrieve campaigns to process in specific-day mode:\n${err.stack}`);
    }

    for(let campaignID of campaignIDs) {
        try {
            await backgroundProcess(sts, ets, campaignID);
        } catch(err) {
            logger.error(`An error occurred while processing campaign ${campaignID}. Processing will continue, but this campaign will not be further processed:\n${err.stack}`);
        }
    }
}
async function campaignRun(argsPackage) {
    let { id, sts, ets, ignoreActiveFlag } = argsPackage;

    // If --ignore-is-active was not specified, check to see if the campaign is active, and throw if it is not (or the campaign is not found).
    if(!ignoreActiveFlag) {
        let campaign = await Campaign.findById(id);
        if(!campaign) {
            throw new Error(`Campaign ${id} does not exist.`);
        }

        if(!campaign.is_active) {
            throw new Error(`Campaign ${id} is not active, and --ignore-is-active was not specified.`);
        }
    }

    // Launch the process and let the powers that be take control.
    // noinspection MagicNumberJS
    logger.info(`Launching processing for campaign ${id} starting on ${sts}(${new Date(sts * 1000).toISOString()}) and ending on ${ets}(${new Date(ets * 1000)})`);
    await backgroundProcess(sts, ets, id);
}
async function clientRun(argsPackage) {
    let { id, sts, ets, ignoreActiveFlag } = argsPackage;
    let is_active = !ignoreActiveFlag;
    let campaigns = [];

    if(is_active) {
        campaigns = await Campaign.find({owner: id, is_active: is_active}, {_id: 1});
    } else {
        campaigns = await Campaign.find({owner: id}, {_id: 1});
    }

    if(campaigns === null || campaigns.length === 0) {
        throw new Error(`No campaigns for client ${id} with active status ${is_active} could be found.`);
    }

    let campaignIDs = campaigns.map((value) => value._id);
    for(let campaignID of campaignIDs) {
        try {
            await backgroundProcess(sts, ets, campaignID);
        } catch(err) {
            logger.error(`An error occurred while processing campaign ${campaignID}. This campaign will not be further processed. Please check logs for partial progress:\n${err.stack}`);
        }
    }
}

let { manual, help } = args;

if(help) {
    console.log(`Billboard Route Creation Script - Adder Mobile Technologies`);
    console.log(`Created by: Brandon Bush`);
    console.log(`Version: ${VERSION}`);
    console.log(`Last Updated: ${LAST_UPDATED}`);
    console.log(``);
    console.log(`Creates routes for billboard campaigns in either an 'automatic' or 'manual' mode.`);
    console.log(``);
    console.log(`Automatic Mode:`);
    console.log(`This script may be run automatically (via cronjobs, Windows task scheduler, etc..) simply by`);
    console.log(`invoking the script with no arguments via Node. In automatic mode, all campaigns containing an is_active`);
    console.log(`field set to \`true\` will have a billboard route created for each of their billboard cones. The created`);
    console.log(`route will correspond to UTC midnight of the day the script is ran on (using machine time as the basis for`);
    console.log(`this calculation.`);
    console.log(``);
    console.log(`Manual Mode:`);
    console.log(`This script can also be run in a manual mode by specifying --manual as a command ling argument. In manual`);
    console.log(`mode, billboard routes are created based on the specified options provided as arguments, which are`);
    console.log(`documented below.`);
    console.log(`WARNING: There is currently no user confirmation of manual mode processes, so be sure that you have your`);
    console.log(`         flags right before running, or you'll be spending the afternoon cleaning out the database.`);
    console.log(``);
    console.log(`Options:`);
    console.log(`    --client: Process all campaigns belonging to the client specified by --id. Mutually exclusive with --campaign.`);
    console.log(`    --campaign: Process the campaign specified by --id. Mutually exclusive with --client.`);
    console.log(`    --specific-day: If specified, always overrides --client and --campaign.`);
    console.log(`    --id: The MongoDB ObjectID (as a string) of either the client or campaign to process. (REQUIRED for --client or --campaign mode.)`);
    console.log(`    --day: A timestamp lying in the day you wish to create a route on. If not specified, the current time is used. (OPTIONAL for --client or --campaign mode. REQUIRED for --specific-day mode)`);
    console.log(`    --ignore-is-active: Specifies whether to ignore the is_active flag on any campaign that is processed by this script. Use this if`);
    console.log(`                        if you want to force a campaign to process. (OPTIONAL)`);
    process.exit(0);
}

if(manual) {
    logger.info(`--manual was specified, script will execute in manual mode.`);
    manualRun().then(() => {
        logger.info(`Manual run has successfully completed. Closing mongoose connections and exiting.`);
        mongoose.disconnect().then(() => {
            logger.info(`Mongoose has disconnected and script has finished. Have a nice day! -B`);
            process.exit(0);
        }).catch((err) => {
            logger.error(`A fatal error occurred during processing. Script will exit immediately:\n${err.stack}`);
        });
    })
} else {
    logger.info(`--manual was not specified, script will execute in automatic mode.`);
    automaticRun().then(() => {
        logger.info(`Automatic run has successfully completed. Closing mongoose connections and exiting.`);
        mongoose.disconnect().then(() => {
            logger.info(`Mongoose has disconnected and script has finished. Have a nice day! -B`);
            process.exit(0);
        });
    }).catch((err) => {
        logger.error(`A fatal error occurred during processing. Script will exit immediately:\n${err.stack}`);
        process.exit(1);
    });
}
