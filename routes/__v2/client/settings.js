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
 * Module: /v2/client/settings
 * Original Filename: settings.js
 * Created by: Brandon Bush
 * Created on: 9/19/19, 2:24 PM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const Client = require("adder-models").Client;

async function updateAccountInfo(req, res, next) {

    let client = null;

    try {
        client = await Client.findById(req.user._id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while retrieving client ${req.user._id} from database:\n${err.stack}`));
    }

    for(let key in req.body) {
        if(req.body.hasOwnProperty(key)) {
            if(typeof key === 'function') {
                res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
                return next(new Error(`Provided key was a function. This may be a security exploit and is not allowed.`));
            } else if(typeof req.body[key] === 'function') {
                res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
                return next(new Error(`Provided value for key ${key} was a function. This may be a security exploit and is not allowed.`));
            }
            client["primary_contact"][key] = req.body[key];
        }
    }

    try {
        await client.save();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred while attempting to save updated client primary_contact info:\n${err.stack}`));
    }

    res.status(HTTPStatusCodes.OK).json({});
    return next();
}

async function getAccountInfo(req, res, next) {
    res.status(HTTPStatusCodes.OK).json(req.user.primary_contact);
    return next();
}

router.get("/contact_info", passport.authenticate("ClientStrategy", { session: false }, null), getAccountInfo);
router.post("/contact_info", passport.authenticate("ClientStrategy", { session: false }, null), updateAccountInfo);

module.exports = router;