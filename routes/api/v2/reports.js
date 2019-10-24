require("dotenv").config();
const router = require('express').Router();
const passport = require('passport');
const fs = require("fs");
const path = require("path");

const rootDir = process.env.ROOT_DIR;
const modulesDir = path.join(rootDir, "modules");
const generatedReportsDir = path.join(rootDir, "generatedReports");

const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const logger = new ImmutableTagLogger(`/api/v2/reports`);

const HTTPCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const ObjectIdValidator = require(modulesDir + "/validation").Mongo.ObjectIdValidator;
const BasicTimestampValidator = require(modulesDir + "/validation").Time.BasicTimestampValidator;
const BasicTimeRangeValidator = require(modulesDir + "/validation").Time.BasicTimeRangeValidator;

const Campaign = require("adder-models").Campaign;
const Geoset = require("adder-models").Geoset;
const ClientFixedPointGeofence = require("adder-models").ClientFixedPointGeofence;
const ClientGeofence = require("adder-models").ClientGeofence;
const Route = require("adder-models").Route;


const campaignIdMiddleware = {
    startProfiling: function(req, res, next) {
        res.locals.__startTime = (new Date()).getTime();
        next();
    },
    parameterValidation: function(req, res, next) {

        const id = String(req.params.id);
        const sts = Number(req.query.sts);
        const ets = Number(req.query.ets);

        let errors = [];

        logger.debug("Beginning validation of input parameters.", "STAGE: parameterValidation");

        if(!ObjectIdValidator.validate(id)) {
            errors.push({err: "INVALID_CAMPAIGN_ID", id: id});
        }
        if(!BasicTimestampValidator.validate(sts)) {
            errors.push({err: "INVALID_STARTING_TIMESTAMP", sts: sts});
        }
        if(!BasicTimestampValidator.validate(ets)) {
            errors.push({err: "INVALID_ENDING_TIMESTAMP", ets: ets});
        }
        if(!BasicTimeRangeValidator.validate(sts, ets)) {
            errors.push({err: "INVALID_TIME_RANGE", sts: sts, ets: ets});
        }

        if(errors.length > 0) {
            return next({err: "PARAMETER_VALIDATION_FAILED", offenders: errors});
        }

        res.locals.id = id;
        res.locals.sts = sts;
        res.locals.ets = ets;

        logger.debug("Input parameter validation has completed. Output for this stage is id: " + id + " sts: " + sts + " ets: " + ets, "STAGE: parameterValidation");

        next();
    },
    retrieveCampaign: async function(req, res, next) {
        try {
            res.locals.campaign = await Campaign.findWithNullCheck(res.locals.id);
        } catch(err) {
            logger.error("A " + err.constructor.name + " exception occurred while retrieving campaign.", "STAGE: retrieveCampaign");
            return next({err: "CAMPAIGN_RETRIEVAL_FAILED", offenders: err.toString()})
        }
        next();
    },
    retrieveGeosets: async function(req, res, next) {
        let geosets = new Map();
        let geoset;
        let geosetsRaw;

        try {
            geosetsRaw = await Geoset.findMultiple(res.locals.campaign.geosets);
        } catch(err) {
            return next({err: "RETRIEVE_GEOSETS_FAILED", offenders: err.toString()});
        }

        for(geoset of geosetsRaw) {
            geosets.set(geoset._id, geoset.toObject());
        }

        res.locals.geosets = geosets;
        next();
    },
    retrieveGeofences: async function(req, res, next) {
        logger.debug("Beginning geofence retrieval.", "STAGE: retrieveGeofences");
        const archetype = res.locals.campaign.campaign_archetype;

        if(archetype === "Advantage" || archetype === "Fleet") {
            let targetGeoIds = Array.from(res.locals.geosets.values()).filter((value) => {
                return (typeof value.target_geo !== "undefined" && value.target_geo);
            }).map((value) => {
                return value.target_geo;
            });

            let targetGeoMap = new Map();

            let targets = [];
            try {
                targets = await ClientGeofence.findMultiple(targetGeoIds);
            } catch(err) {
                return next({err: "TARGET_GEOFENCE_RETRIEVAL_FAILED", offenders: err.toString()});
            }

            for(let target of targets) {
                targetGeoMap.set(target._id, target);
            }

            res.locals.targetGeofencesMap = targetGeoMap;
        } else if(archetype === "Billboard") {
            let billboardIds = Array.from(res.locals.geosets.values()).filter((value) => {
                return (Array.isArray(value.billboards) && value.billboards.length > 0);
            }).reduce((last, current) => {
                return last.concat(current.billboards);
            }, []);

            let billboards = [];
            let billboardMap = new Map();
            try {
                billboards = await ClientFixedPointGeofence.findMultiple(billboardIds);
            } catch(err) {
                return next({err: "BILLBOARD_RETRIEVAL_FAILED", offenders: err.toString()});
            }

            let coneIds = [];
            let cones = [];
            let coneMap = new Map();
            for(let billboard of billboards) {
                coneIds.push(billboard.properties.cone_id);
                billboardMap.set(billboard._id, billboard);
            }

            res.locals.billboardMap = billboardMap;

            try {
                cones = await ClientGeofence.findMultiple(coneIds);
            } catch(err) {
                return next({err: "CONE_RETRIEVAL_FAILED", offenders: err.toString()});
            }

            for(let cone of cones) {
                coneMap.set(cone._id, cone);
            }

            res.locals.coneMap = coneMap;
        } else {
            return next({err: "INVALID_CAMPAIGN_ARCHETYPE", offenders: res.locals.campaign_archetype});
        }

        let convGeoIds = Array.from(res.locals.geosets.values()).filter((value) => {
            return (Array.isArray(value.conv_geos) && value.conv_geos.length > 0);
        }).map((value) => {
            return value.conv_geos;
        }).reduce((last, current) => {
            return last.concat(current);
        }, []);

        logger.debug("Conversion Geo Ids to search: " + JSON.stringify(convGeoIds, null, 4), "STAGE:" +
            " retrieveGeofences");

        let conversionGeos = [];
        try {
            conversionGeos = await ClientGeofence.findMultiple(convGeoIds);
        } catch(err) {
            console.log(err.toString());
            return next({err: "CONVERSION_GEOFENCE_RETRIEVAL_FAILED", offenders: err.toString()});
        }

        let conversionGeofenceMap = new Map();
        for(let convGeo of conversionGeos) {
            conversionGeofenceMap.set(convGeo._id, convGeo);
        }

        res.locals.conversionGeofenceMap = conversionGeofenceMap;

        next();
    },
    retrieveRoutes: async function(req, res, next) {
        logger.debug("Beginning route retrieval.", "STAGE: retrieveRoutes");
        let id = res.locals.campaign._id;
        if(!id) {
            return next({err: "CAMPAIGN_ID_MISSING", offenders: res.locals.campaign});
        }

        let routeMap = new Map();
        try {
            let routes = await Route.findMultipleByOwner(id);
            routes.filter((value) => {
                return (value.ro.sts >= res.locals.sts && value.ro.ets <= res.locals.ets);
            }).forEach((value) => {
                routeMap.set(value._id, value);
            });
        } catch(err) {
            logger.error("A " + err.constructor.name + " exception occurred while retrieving routes.", "STAGE:" +
                " retrieveRoutes");
            return next({err: "ROUTE_RETRIEVAL_FAILED", offenders: err.toString()});
        }

        res.locals.routeMap = routeMap;
        next();
    },
    constructCsv: async function(req, res, next) {
        logger.debug("Beginning CSV construction.", "STAGE: constructCsv");

        const routeHeaders =
            "route_id," +
            "total_impressions," +
            "unique_impressions," +
            "estimated_impressions," +
            "total_conversions," +
            "unique_conversions," +
            "estimated_conversions" +
            "utc_start," +
            "start_time," +
            "utc_end," + "" +
            "end_time\n";

        let routeData = [];
        res.locals.routeMap.forEach((value, key) => {
            const stsString = new Date(value.ro.sts * 1000).toISOString().replace("Z", "GMT+0");
            const etsString = new Date(value.ro.ets * 1000).toISOString().replace("Z", "GMT+0");

            let ei = (value.ro.ei !== undefined && value.ro.ei !== null) ? value.ro.ei : 0;
            let ec = (value.ro.ec !== undefined && value.ro.ec !== null) ? value.ro.ec : 0;

            let data =
                key + "," +
                value.ro.ti + "," +
                value.ro.ui + "," +
                ei + "," +
                value.ro.tc + "," +
                value.ro.uc + "," +
                ec + "," +
                value.ro.sts + "," +
                stsString + "," +
                value.ro.ets + "," +
                etsString;
            routeData.push(data);
        });

        let csvOutString = res.locals.campaign.campaign_name + "\n";
        csvOutString += routeHeaders;
        for(let data of routeData) {
            csvOutString += data + "\n";
        }

        const reportName = req.user._id + "_" + res.locals.campaign._id + "_" + (new Date()).getTime() + ".csv";

        if(!fs.existsSync(generatedReportsDir)) {
            logger.info("Could not find generated reports directory. Creating now.", "STAGE: constructCsv");
            fs.mkdirSync(generatedReportsDir);
            if(!fs.existsSync(generatedReportsDir)) {
                return next({err: "COULD_NOT_CREATE_GEN_REPORT_DIR", offenders: generatedReportsDir});
            }
        }

        const csvPath = generatedReportsDir + path.sep + reportName;
        fs.writeFileSync(csvPath, csvOutString);
        if(!fs.existsSync(csvPath)) {
            return next({err: "COULD_NOT_CREATE_GEN_REPORT", offenders: [csvPath, csvOutString]});
        }

        res.locals.csvPath = csvPath;

        next();
    },
    errorHandler: async function(err, req, res, next) {
        logger.error("An error occurred during operation.", "STAGE: errorHandler");
        logger.error(JSON.stringify(err, null, 4));
        res.locals.statusCode = HTTPCodes.INTERNAL_SERVER_ERROR;
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        next();
    },
    finishProfiling: function(req, res, next) {
        const runTime = (new Date()).getTime() - res.locals.__startTime;
        logger.profile( req.url + " -- (" + res.locals.statusCode + ") -- " + runTime + "ms");
    }
};


router.get("/campaign/:id",
    passport.authenticate("jwt", {session: false}),
    campaignIdMiddleware.startProfiling,
    campaignIdMiddleware.parameterValidation,
    campaignIdMiddleware.retrieveCampaign,
    campaignIdMiddleware.retrieveGeosets,
    campaignIdMiddleware.retrieveGeofences,
    campaignIdMiddleware.retrieveRoutes,
    campaignIdMiddleware.constructCsv,
    function(req, res, next) {
        res.locals.statusCode = HTTPCodes.OK;
        res.status(HTTPCodes.OK).download(res.locals.csvPath);
        next();
    },
    campaignIdMiddleware.errorHandler,
    campaignIdMiddleware.finishProfiling
    );

module.exports = router;
