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
 * Module: v2-webhook-update-normal_route
 * Original Filename: normalRoute.js
 * Created by: Brandon Bush
 * Created on: 8/2/19, 6:40 PM
 */

require("dotenv").config();
const router = require('express').Router();
const passport = require("passport");

const HTTPCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const Route = require("adder-models").Route;

const execute = async (req, res, next) => {
    if(req.body.rid === undefined || req.body.rid === null) {
        res.status(HTTPCodes.BAD_REQUEST).end();
        return next(new Error("Request was missing route id in body."));
    }

    let route;
    try {
        route = await Route.findById(req.body.rid);
    } catch(err) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        throw new Error(`Mongoose threw error while attempting to retrieve route ${req.body.rid}. Error was: ${err.stack}`);
    }
    if(route === null) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        throw new Error(`Mongoose successfully completed retrieval for ${req.body.rid}, but retrieved route was null.`);
    }
    //endregion

    //region Update the Stats
    route.ro = {
        ti: req.body.stats.ti,
        ui: req.body.stats.ui,
        ei: req.body.stats.ei,
        tc: req.body.stats.tc,
        uc: req.body.stats.uc,
        ec: req.body.stats.ec,
        tdt: req.body.stats.tdt,
        tp: req.body.stats.tp,
        sid: route.ro.sid,
        sts: route.ro.sts,
        ets: route.ro.ets,
        dst: route.ro.dst,
        cref: route.ro.cref,
        dref: route.ro.dref
    };
    route.cones = {};
    route.idb_complete = req.body.stats.idb_complete;
    //endregion

    try {
        await route.save();
    } catch(err) {
        res.status(HTTPCodes.INTERNAL_SERVER_ERROR).end();
        throw new Error(`An error occurred while attempting to save updated route ${req.body.rid}. Error was: ${err.stack}`);
    }

    res.status(HTTPCodes.OK).end();
    next();
};

router.post('/', passport.authenticate("impressionsAPI", {session: false}, null), execute);

module.exports = router;