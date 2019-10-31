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
 * Module: v2/asset/geofence
 * Original Filename: geofence.js
 * Created by: Brandon Bush
 * Created on: 9/11/19, 5:00 PM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const objectIDRegex = require("node-common-utility").Regex.mongoDBObjectIDRegex;

const ClientGeofence = require("adder-models").ClientGeofence;

router.get("/:id",
    passport.authenticate("ClientStrategy", { session : false }, null),
    async function (req, res, next) {
        const { id } = req.params;

        if(!id) {
            res.status(HTTPStatusCodes.BAD_REQUEST).json({});
            return next(new Error(`Request missing url ':id' parameter.`));
        }

        if(!objectIDRegex.test(id)) {
            res.status(HTTPStatusCodes.BAD_REQUEST).json({});
            return next(new Error(`Requested asset _id ${id} failed ObjectID regex test.`));
        }

        let geofence = null;

        try {
            geofence = await ClientGeofence.findById(id).lean();
        } catch(err) {
            res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
            return next(new Error(`An error occurred while attempting to retrieve geofence ${id}:\n${err.stack}`));
        }

        if(geofence === null) {
            res.status(HTTPStatusCodes.NOT_FOUND).json({});
            return next(new Error(`Requested geofence ${id} does not exist in database.`));
        }

        //region Cleanup The Doc A Little Before Sending Back
        geofence.properties._id = geofence._id;
        delete geofence._id;

        // Some geofences may be stored as LineStrings, when they should actually be Polygons. This block of code makes
        // that conversion, if needed.
        if(geofence.geometry.type === "LineString") {
            geofence.geometry.type = "Polygon";
            geofence.geometry.coordinates = [ geofence.geometry.coordinates ]
        }
        //endregion

        res.status(HTTPStatusCodes.OK).json(geofence);
        return next();
});
router.post("/update_name/:id", passport.authenticate("ClientStrategy", { session: false }, null), async function(req, res, next) {
    const { id } = req.params;
    const { new_name } = req.body;

    if(!id) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request missing url ':id' parameter.`));
    }

    if(!objectIDRegex.test(id)) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Requested asset _id ${id} failed ObjectID regex test.`));
    }

    if(!new_name) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request missing 'new_name' parameter in body.`));
    }

    if(typeof new_name !== "string") {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request body value 'new_name' contained invalid parameter (NOT STRING).`));
    }

    let geofence = null;

    try {
        geofence = await ClientGeofence.findById(id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while attempting to retrieve geofence ${id}:\n${err.stack}`));
    }

    if(geofence === null) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({});
        return next(new Error(`Requested geofence ${id} does not exist in database.`));
    }

    geofence["properties"]["asset_name"] = new_name;

    try {
        await geofence.save();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while attempting to save new name for geofence ${id}:\n${err.stack}`));
    }
    res.status(HTTPStatusCodes.OK).json({});
    return next();
});
module.exports = router;