require("dotenv").config();
const router = require('express').Router();
const passport = require('passport');
const fs = require("fs");
const path = require("path");

const generatedReportsDir = path.join(process.env.ROOT_DIR, "generatedReports");

const HTTPCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;

const Regex = require("node-common-utility").Regex;

const Campaign = require("adder-models").Campaign;
const Route = require("adder-models").Route;
const Driver = require("adder-models").Driver;
const Billboard = require("adder-models").Billboard;

function validateRequest(req) {
    if(req.params.id === undefined || req.params.id === null) {
        return new Error("Request missing url parameter :id (for campaign id)!");
    }
    if(req.query.sts === undefined || req.query.id === null) {
        return new Error("Request missing query parameter sts!");
    }
    if(req.query.ets === undefined || req.query.ets === null) {
        return new Error("Request missing query parameter ets!");
    }

    if(!Regex.mongoDBObjectIDRegex.test(req.params.id)) {
        return new Error(`Request campaign id ${req.params.id} failed ObjectId regex test.`);
    }
    if(!Regex.utcSecondsRegex.test(req.query.sts)) {
        return new Error(`Request sts ${req.query.sts} failed UTC Timestamp regex test.`);
    }
    if(!Regex.utcSecondsRegex.test(req.query.ets)) {
        return new Error(`Request ets ${req.query.ets} failed UTC Timestamp regex test.`)
    }

    return true;
}
async function execute(req, res, next) {
    const logger = new ImmutableTagLogger("/v2/analytics/report");

    //region Validate Input
    let requestIsValid = validateRequest(req);
    if(!requestIsValid) {
        res.status(HTTPCodes.BAD_REQUEST).end();
        return next(requestIsValid);
    }
    //endregion

    const id = String(req.params.id);
    const sts = Number(req.query.sts);
    const ets = Number(req.query.ets);
    let campaign = null;
    let routes = [];

    //region Retrieve the Campaign
    try {
        campaign = await Campaign.findById(id).lean();
    } catch(err) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error ocurred during campaign retrieval:\n${err.stack}`));
    }
    if(campaign === null) {
        res.status(HTTPCodes.NOT_FOUND).end();
        return next(new Error(`Campaign retrieval for ${id} completed successfully, but no campaign could be found.`));
    }
    //endregion

    //region Retrieve Routes
    try {
        routes = await Route.find({"ro.cref": id, "ro.sts": {$gte: sts}, "ro.ets": {$lte: ets}});
    } catch(err) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while retrieving routes from the database:\n${err.stack}`));
    }
    //endregion

    //region Construct the CSV
    let routeHeaders =
		"date," +
        "asset_name," +
        "total_impressions," +
        "unique_impressions," +
        "estimated_impressions," +
        "total_conversions," +
        "unique_conversions," +
        "estimated_conversions," +
        "total_conversion_rate," +
        "unique_conversion_rate," +
        "estimated_conversion_rate," +
        "utc_start," +
        "start_time," +
        "utc_end," +
        "end_time," +
        "route_id";

    if(campaign.services_enabled && campaign.services_enabled.ip_data && campaign.services_enabled.ip_data.csv) {
        routeHeaders +=
            ",ipv4," +
            "ipv6";
    }

    routeHeaders += "\n";

    routes = await Promise.all(routes.map(async (value) => {

        //region Add Basic Stats
        // noinspection MagicNumberJS
        const stsString = new Date(value.ro.sts * 1000).toISOString().replace("Z", "GMT+0");
        // noinspection MagicNumberJS
        const etsString = new Date(value.ro.ets * 1000).toISOString().replace("Z", "GMT+0");

        let dateSplit = stsString.split("T");

        let ei = (value.ro.ei !== undefined && value.ro.ei !== null) ? value.ro.ei : 0;
        let ec = (value.ro.ec !== undefined && value.ro.ec !== null) ? value.ro.ec : 0;

        //region If Estimated Values are Zero, Set Them To Corresponding Non-Zero Values

        ei = (ei === 0) ? value.ro.ti : ei;
        ec = (ec === 0) ? value.ro.uc : ec;

        //endregion

        let totalConversionRate = 0.0;
        let uniqueConversionRate = 0.0;
        let extrapolatedConversionRate = 0.0;
        if(value.ro.ti !== 0) {
            totalConversionRate = (value.ro.tc / value.ro.ti);
        }

        if(value.ro.ui !== 0) {
            uniqueConversionRate = (value.ro.uc / value.ro.ui);
        }

        if(ei !== 0) {
            extrapolatedConversionRate = (ec / ei);
        }


        let assetName = "\"\"";
        if(value.type === "Billboard") {
            try {
                let billboard = await Billboard.findById(value.cones._id);
                assetName = "\"" + billboard["properties"]["asset_name"] + "\"";
            } catch(err) {
                logger.error(`A non-fatal error has occurred while retrieving Billboard asset for csv line asset_name:\n${err.stack}`);
            }
        } else {
            try {
                let driver = await Driver.findById(value.ro.dref).lean();
                if(driver.vehicle) {
                    let { year, make, model } = driver.vehicle;
                    if(year && make && model) {
                        assetName = `"${year.trim()} ${make.trim()} ${model.trim()}"`;
                    } else {
                        assetName = value.ro.dref
                    }
                }
            } catch(err) {
                logger.error(`A non-fatal error has occurred while retrieving Driver asset for csv line asset_name:\n${err.stack}`);
                assetName = value.ro.dref;
            }
        }

        let returnString =
            dateSplit[0] + "," +
            assetName + "," +
            value.ro.ti + "," +
            value.ro.ui + "," +
            ei + "," +
            value.ro.tc + "," +
            value.ro.uc + "," +
            ec + "," +
            totalConversionRate.toFixed(6) + "," +
            uniqueConversionRate.toFixed(6) + "," +
            extrapolatedConversionRate.toFixed(6) + "," +
            Math.floor(value.ro.sts) + "," +
            stsString + "," +
            Math.floor(value.ro.ets) + "," +
            etsString + "," +
            value._id;

        //endregion

        //region Add IP Data, if enabled
        if(campaign.services_enabled && campaign.services_enabled.ip_data && campaign.services_enabled.ip_data.csv) {
            logger.debug("IP_DATA has been enabled for this campaign");
		let ipv4Data = [];
            let ipv6Data = [];
            try {
                if(value.ip_data && Array.isArray(value.ip_data)) {
                    for(let ipData of value.ip_data) {
                        ipv4Data = ipv4Data.concat(ipData.ipv4);
                        ipv6Data = ipv6Data.concat(ipData.ipv6);
                    }

                    ipv4Data = ipv4Data.reduce((accumulator, value) => {
                        return accumulator + String(value) + ",";
                    }, "");

                    ipv6Data = ipv6Data.reduce((accumulator, value) => {
                        return accumulator + String(value) + ",";
                    }, "");

                    ipv4Data = ipv4Data.substring(0, ipv4Data.length - 1);
                    ipv6Data = ipv6Data.substring(0, ipv6Data.length - 1);

                    returnString += `,"${ipv4Data}","${ipv6Data}"`;
                } else {
                    returnString += `,"",""`;
                }

            } catch(err) {
                returnString += `"",""`;
                logger.error(`A non-fatal error occurred while constructing ip data string:\n${err}`);
            }
        }

        //endregion

        return returnString;
    }));
    
    let csvOutString = campaign.campaign_name + "\n" + routeHeaders;
    for(let data of routes) {
        csvOutString += data + "\n";
    }

    const reportName = req.user._id + "_" + campaign._id + "_" + (new Date()).getTime() + ".csv";

    if(!fs.existsSync(generatedReportsDir)) {
        fs.mkdirSync(generatedReportsDir);
        if(!fs.existsSync(generatedReportsDir)) {
            res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
            return next(new Error("Could not create generated report directory."));
        }
    }

    const csvPath = generatedReportsDir + path.sep + reportName;
    fs.writeFileSync(csvPath, csvOutString);
    if(!fs.existsSync(csvPath)) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error("Could not write generated report."));
    }
    //endregion

        res.status(HTTPCodes.OK).download(csvPath);
        return next();
}

router.get("/:id", passport.authenticate("ClientStrategy", {session: false}, null), execute);

module.exports = router;
