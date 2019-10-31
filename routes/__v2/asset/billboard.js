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
 * Module: v2/asset/billboard GET
 * Original Filename: billboard.js
 * Created by: Brandon Bush
 * Created on: 9/13/19, 9:04 AM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const objectIDRegex = require("node-common-utility").Regex.mongoDBObjectIDRegex;

const Billboard = require("adder-models").Billboard;

router.get("/:id",  passport.authenticate("ClientStrategy", { session : false }, null), async function (req, res, next) {
    const { id } = req.params;

    if(!id) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "MISSING_QUERY_PARAMETER: id"
        });
        return next(new Error(`Request missing url ':id' parameter.`));
    }

    if(!objectIDRegex.test(id)) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "INVALID_QUERY_PARAMETER: id"
        });
        return next(new Error(`Requested asset _id ${id} failed ObjectID regex test.`));
    }

    let billboard = null;

    try {
        billboard = await Billboard.findById(id).lean();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({
            err: "INTERNAL_SERVER_ERROR"
        });
        return next(new Error(`An error occurred while attempting to retrieve billboard ${id}:\n${err.stack}`));
    }

    if(billboard === null) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({
            err: `Requested asset ${id} could not be found.`
        });
        return next(new Error(`Requested billboard ${id} does not exist in database.`));
    }

    //region Clean Up The Doc Before Returning
    billboard["properties"]["_id"] = billboard["_id"];
    delete billboard["_id"];
    //endregion

    res.status(HTTPStatusCodes.OK).json(billboard);
    return next();
});

router.post("/update_name/:id",  passport.authenticate("ClientStrategy", { session : false }, null), async function (req, res, next) {
    const { id } = req.params;
    const { new_name } = req.body;

    if(!id) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "MISSING_QUERY_PARAMETER: id"
        });
        return next(new Error(`Request missing url ':id' parameter.`));
    }

    if(!objectIDRegex.test(id)) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "INVALID_QUERY_PARAMETER: id"
        });
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

    let billboard = null;

    try {
        billboard = await Billboard.findById(id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({
            err: "INTERNAL_SERVER_ERROR"
        });
        return next(new Error(`An error occurred while attempting to retrieve billboard ${id}:\n${err.stack}`));
    }

    if(billboard === null) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({
            err: `Requested asset ${id} could not be found.`
        });
        return next(new Error(`Requested billboard ${id} does not exist in database.`));
    }

    console.log(billboard);
    billboard["properties"]["asset_name"] = new_name;

    try {
        await billboard.save();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({
            err: "INTERNAL_SERVER_ERROR"
        });
        return next(new Error(`An error occurred while attempting to update billboard name for ${id}:\n${err.stack}`));
    }

    res.status(HTTPStatusCodes.OK).json({});
    return next();
});

module.exports = router;