require("dotenv").config();
const router = require('express').Router();
const passport = require('passport');
const util = require("util");
const Axios = require("axios");
const path = require("path");

const Driver = require("adder-models").Driver;
const Route = require("adder-models").Route;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;


//TODO: VALIDATE
//  WHAT IF THE FORMAT ROUTE FUNCTION RETURNS INVALID POINTS?
//TODO: USE SESSION IDS TO STITCH TOGETHER BROKEN APART ROUTES INTO ONE!!!
//todo: CHECK IF THE IMPRESSION API IS UP AND RUNNING. IF NOT, STORE ROUTE FOR LATER PROCESSING
//  IMPLEMENTATION: REVIEW
//  INPUT VALIDATION: NEEDS FORMATTED ROUTE DATA VALIDATION, NEEDS INPUT POINT MODEL VALIDATION, NEEDS LOGIC TO DEAL WITH INVALID POINTS RETURNED FROM IMPRESSIONS API, OTHERWISE YES FOR ALL REQUEST PARAMETERS
//  ERROR HANDLING: FOR IMPLEMENTED FEATURES
//  ERROR LOGGING: LOGGED TO FILE \logs\_api_route_.log
//  DATABASE FIDELITY: NONE
//  EXCEPTION SAFETY: NONE
//  ROUTE METRICS: NONE
router.post('/', passport.authenticate('jwt', {session: false}), async function(req, res) {
    const postRouteLog = new ImmutableTagLogger("POST /api/route/ <" + req.user._id + ">");
	const threadTag = "\{POST, " + req.user._id + "\}";
    const requestBodyTruncated = JSON.stringify(util.inspect(req.body)).length > 10000 ?  JSON.stringify(util.inspect(req.body)).substring(0, 10000) :  JSON.stringify(util.inspect(req.body));
    const decodedUser = JSON.stringify(util.inspect(req.user));

    const {pings, start_timestamp, end_timestamp, session_id} = req.body;
    const driverId = req.user.driver_id;

    const impressionsRadValue = 150;
    const impressionsRslValue = 240;
    const pathsRslValue = 43200;
    let driver = null;
    let campaignRef = "none";
    let driverRef;
    let pingsIn = [];
    let formattedRoute = {};
    let totalDistance = 0;

    postRouteLog.info("New route received.", threadTag);

    //region Input Validation
    if(!Array.isArray(pings) || pings.length === 0) {
        postRouteLog.error("Body was missing pings! " + requestBodyTruncated, threadTag);
        return res.status(400).end();
    }

    //TODO: VALIDATE EACH POINT IN THE PINGS ARRAY AGAINST THE OLD ROUTE SCHEMA

    if(typeof start_timestamp !== 'number') {
        postRouteLog.error("Body was missing start_timestamp! " + requestBodyTruncated, threadTag);
        return res.status(400).end();
    }

    if(typeof end_timestamp !== 'number') {
        postRouteLog.error("Body was missing end_timestamp! " + requestBodyTruncated, threadTag);
        return res.status(400).end();
    }

    if(typeof session_id !== 'string') {
        postRouteLog.error("Body was missing session_id! " + requestBodyTruncated, threadTag);
        return res.status(400).end();
    }

    if(typeof driverId !== 'string') {
        postRouteLog.error("Failed to determine driver_id from decoded JWT token. This should not happen. " + decodedUser, threadTag);
        return res.status(400).end();
    }
    //endregion

    //region Get Driver information
    try {
        driver = await Driver.findById(driverId);
        if(!driver) {
            postRouteLog.error(" Unable to find driver with id: " + driverId + ". This should not happen " + decodedUser + " | " + requestBodyTruncated, threadTag);
            return res.status(400).json({success: false, msg: "DRIVER_NOT_FOUND"});
        }
    } catch(err) {
        postRouteLog.error(" An error occurred when fetching driver from database: " + JSON.stringify(util.inspect(err)) + " | " + requestBodyTruncated, threadTag);
        return res.status(400).json({success: false, msg: err.message});
    }

    if (typeof driver.current_campaign !== 'undefined' && driver.current_campaign) {
        campaignRef = driver.current_campaign;
    }

    driverRef = driver._id;
    //endregion

    //region Format Route to send to Impressions Endpoint
    for(let pingData of req.body.pings) {
        const ping = {
            type: "Feature",
            properties: {
                ts: pingData.timestamp,
                spd: pingData.speed,
                ber: pingData.bearing,
                alt: pingData.alt,
                bat: pingData.battery,
                lex: pingData.limit_exceeded,
                rad: impressionsRadValue,
                rsl: impressionsRslValue
            },
            location: {
                type: "Point",
                coordinates: [
                    pingData.lng,
                    pingData.lat
                ]
            }
        };
        pingsIn.push(ping);
    }
    //endregion

	formattedRoute.pts = pingsIn
    //region Get Formatted Route with Impressions Data
    //try {
    //    formattedRoute = await formatRouteImpressions(pingsIn);
    //} catch(err) {
    //    postRouteLog.error("formatRouteImpressions(pingsIn) returned with err: " + err.stack, threadTag);
    //    return res.status(500).end();
    //}
    //endregion



    //region Calculate the Total Distance Travelled on the Route
    for(let i = 1; i < formattedRoute.pts.length; i++) {
        const coord1 = {
            lng: formattedRoute.pts[i - 1].location.coordinates[0],
            lat: formattedRoute.pts[i - 1].location.coordinates[1]
        };
        const coord2 = {
            lng: formattedRoute.pts[i].location.coordinates[0],
            lat: formattedRoute.pts[i].location.coordinates[1]
        };
        totalDistance += calculateDistanceInMiles(coord1, coord2);
    }
    //endregion

    //region Tag the Route Overview Stats and Route Version
    formattedRoute.dv = "v2";
	formattedRoute.ro = {};
    formattedRoute.ro.sid = req.body.session_id;
    formattedRoute.ro.cref = campaignRef;
    formattedRoute.ro.dref = driverRef;
    formattedRoute.ro.sts = req.body.start_timestamp;
    formattedRoute.ro.ets = req.body.end_timestamp;
    formattedRoute.ro.dst = totalDistance;
	formattedRoute.io = [];
    formattedRoute.cones = {
    	type: "Feature",
	    geometry: {
		    type: "Polygon",
		    coordinates: [[[30, 40], [31, 40], [30,40]]]
		},
	    properties: {}
	    };
	   
	//endregion

    // region Create and Save the Route
    formattedRoute.last_updated = 0;
    const route = new Route(formattedRoute);
    try {
        await route.save();
    } catch (err) {
        postRouteLog.error("An error occurred while saving formatted route to database. Nothing was added to DB, fidelity intact. Error was: " + JSON.stringify(util.inspect(err)) + " | " + requestBodyTruncated, threadTag);
        return res.status(500).end();
    }
    //endregion

    postRouteLog.info("Successfully saved formatted route to database with id: " + formattedRoute, threadTag);
    return res.status(200).json({success: true, msg: "Route uploaded!", rte:formattedRoute});
});

async function formatRouteImpressions(pingArr) {
    return new Promise((resolve, reject) => {
        let endpoint = process.env.IMPRESSIONS_API_HOST + "/internal/impressions/route";

        const config = {
            method: "POST",
            url: endpoint,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: pingArr
        };

        Axios(config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject({code: 500, err: error});
            });
    });
}

function calculateDistanceInMiles(coord1, coord2) {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    };

    const lat2 = coord2.lat;
    const lon2 = coord2.lng;
    const lat1 = coord1.lat;
    const lon1 = coord1.lng;

    const R = 3963.1676; // return distance in miles

    const x1 = lat2-lat1;
    const dLat = x1.toRad();
    const x2 = lon2-lon1;
    const dLon = x2.toRad();
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;

}

module.exports = router;
