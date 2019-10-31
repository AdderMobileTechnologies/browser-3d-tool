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
 * Module: <INSERT_MODULE_NAME>
 * Original Filename: ipData.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 10/14/19, 2:00 PM
 */

const router = require('express').Router();
const passport = require('passport');

const mongo = require("mongodb");
const mongoUrl = `mongodb://${process.env.PORTAL_DB_USER}:${process.env.PORTAL_DB_PASS}@localhost:27017/APIDB?authSource=admin&authMechanism=DEFAULT`;
const mongoOptions = {
    useNewUrlParser: true
};
let client = null;

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
const logger = new ImmutableTagLogger("/v2/webhook/update/ip_data");
const resetLogger = new ImmutableTagLogger("/v2/webhook/update/ip_data/reset");
const appendLogger = new ImmutableTagLogger("/v2/webhook/update/ip_data/append");

const checkEndpointAuthorization = require("authorization").checkEndpoint;

async function initializeMongo(req, res, next) {
    // If client !== null, then the database connection is already initialized
    if(client !== null) {
        return next();
    }

    try {
        logger.debug("Initializing database connection.");
        client = await new mongo.MongoClient.connect(mongoUrl, mongoOptions);
        logger.debug("Database initialization has completed");
    } catch(err) {
        return next(new Error(`Failed to create connection to database:\n${err}`));
    }
    return next();
}
router.post("/reset", passport.authenticate("impressionsAPI", {session: false}, null), initializeMongo, checkEndpointAuthorization, async function (req, res, next) {

    resetLogger.debug("Hit on endpoint");
    let {rid} = req.body;

    if(!rid) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request missing route id field marked by 'rid'`));
    }

    try {
        await client.db("RoutesDB").collection("Routes").updateOne({_id: mongo.ObjectID(rid)}, {$set: {"ip_data": []}});
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while attempting to unset ip_data field for route ${rid}:\n${err}`));
    }

    logger.debug(`Successfully reset ip_data for route ${rid}`);
    res.status(HTTPStatusCodes.OK).json({});
    return next();
});

router.post("/append", passport.authenticate("impressionsAPI", {session: false}, null), initializeMongo, checkEndpointAuthorization, async function(req, res, next) {
    appendLogger.debug("Hit on endpoint");
    let {rid, newData} = req.body;

    if(!rid) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request missing route id field marked by 'rid'`));
    }

    if(!newData) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request missing new ip data to append marked by 'newData'`));
    }

    if(!Array.isArray(newData)){
        res.status(HTTPStatusCodes.BAD_REQUEST).json({});
        return next(new Error(`Request field 'newData' is expected to be an array, but was not.`));
    }

    try {
        logger.debug(`Pushing ${newData.length} new ip points.`);
        await client.db("RoutesDB").collection("Routes").updateOne({_id: mongo.ObjectID(rid)}, {$push: {"ip_data": {$each: newData}}});
        logger.debug(`Finished pushing ip data`);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while attempting to append data to route ${rid}:\n${err}`));
    }

    logger.debug(`Successfully appended ip_data for route ${rid}`);
    res.status(HTTPStatusCodes.OK).json({});
    return next();
});

module.exports = router;