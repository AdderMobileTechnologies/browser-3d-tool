/*
 * Copyright (C) 2019 Adder Mobile Technologies, Inc.
 * All Rights Reserved
 *
 * This file and its contents are the exclusive property of Adder Mobile Technologies, Inc.
 * Only approved personal are authorized to view, modify, distribute, discuss, execute, or otherwise
 * utilize or manipulate this file in any capacity, including but not limited to personal or commercial
 * use, distribution via any combination of physical or digital means, and physical reproduction
 * of this files contents or any of its associated metadata.
 *
 * Any questions may be directed to Brandon Bush<b.bush@adder.io>, CTO
 *
 * Project: web-api
 * Module: v2-webhook-update-billboard_route
 * Original Filename: billboardRoute.js
 * Created by: Brandon Bush
 * Created on: 7/31/19, 3:00 PM
 */

const router = require('express').Router();
const passport = require("passport");
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const Route = require("adder-models").Route;

let logger = new ImmutableTagLogger("/v2/webhook/update/billboard_route");

const execute = async (req, res, next) => {
    logger.debug("Endpoint triggered.");
	if(req.body.rid === undefined || req.body.rid === null) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error("Request was missing route id in body."));
    }

    if(req.body.rid === "NEW") {
        await __newRoute(req, res, next);
    } else {
        await __updateRoute(req, res, next);
    }
};

async function __newRoute(req, res, next) {
    logger.debug("Received route was a new route, inside __newRoute");
    const ro = {
        unique_ids: req.body.uids,
        ti: req.body.stats.ti,
        ui: req.body.stats.ui,
        ei: req.body.stats.ei,
        tc: req.body.stats.tc,
        uc: req.body.stats.uc,
        ec: Number(req.body.stats.ec),
        tp: req.body.stats.tp,
        unique_sg_devices: req.body.stats.unique_sg_devices,
        tdt: req.body.stats.tdt,
        sid: new Date().getTime(),
        cref: req.body.cid,
        dref: "null",
        sts: req.body.sts,
        ets: req.body.ets,
        dst: 0
    };

    const routeData = {
        type: "Billboard",
        ro: ro,
        pts: [],
        dv: "v2",
        last_updated: (new Date().getTime() / 1000),
        cones: req.body.cone,
        created: (new Date().getTime() / 1000),
        idb_complete: req.body.stats.idb_complete
    };

    const routeModel = new Route(routeData);

    routeModel.ip_data = req.body.ipData || [];
    routeModel.markModified("ip_data");

    try {
        logger.debug("Beginning save");
        await routeModel.save();
        logger.debug("Save completed");
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while attempting so save new route:\n${err.stack}`));
    }

    logger.debug("Setting headers and closing request stream.");
    res.status(HTTPStatusCodes.OK).end();
    next();
}

async function __updateRoute(req, res, next) {
    logger.debug("Received route was an update. Inside __updateRoute");
    let route;
    try {
        route = await Route.findById(req.body.rid);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`Mongoose threw error while attempting to retrieve route ${req.body.rid}. Error was: ${err.stack}`));
    }
    if(route === null) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`Mongoose successfully completed retrieval for ${req.body.rid}, but retrieved route was null.`));
    }

    //region Update the Stats
    route.ro = {
        unique_ids: req.body.uids,
        ti: req.body.stats.ti,
        ui: req.body.stats.ui,
        ei: req.body.stats.ei,
        tc: req.body.stats.tc,
        uc: req.body.stats.uc,
        ec: req.body.stats.ec,
        tdt: req.body.stats.tdt,
        tp: req.body.stats.tp,
        unique_sg_devices: req.body.stats.unique_sg_devices,
        sid: route.ro.sid,
        sts: route.ro.sts,
        ets: route.ro.ets,
        dst: route.ro.dst,
        cref: route.ro.cref,
        dref: route.ro.dref
    };

    route.cone = req.body.cone;
    route.idb_complete = req.body.stats.idb_complete;
    route["ip_data"] = req.body.ipData || [];
    route.markModified("ip_data");

    try {
        logger.debug("Beginning save");
        await route.save();
        logger.debug("Save completed");
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while attempting to save updated route ${req.body.rid}. Error was:\n${err.stack}`));
    }

    logger.debug("Setting headers and closing request stream.");
    res.status(HTTPStatusCodes.OK).end();
    next();
}

router.post('/', passport.authenticate("impressionsAPI", {session: false}, null), execute);

module.exports = router;
