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
 * Original Filename: clientLogin.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 9/16/19, 4:53 PM
 */

const router = require('express').Router();
const jwt = require("jwt-simple");

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const User = require("adder-models").User;
const Client = require("adder-models").Client;

router.post("/", async function(req, res, next) {
    let user = null;
    let client = null;
    let { email, password } = req.body;

    //region Validate Input
    //TODO: REGEX TEST FOR EMAIL AND PASSWORD!
    if(!email) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error(`Email was missing from request.`));
    }
    if(!password) {
        res.status(HTTPStatusCodes.BAD_REQUEST).end();
        return next(new Error(`Password was missing from request.`));
    }
    //endregion

    //region Find User
    try {
        user = await User.findOne({email: email});
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while retrieving user entry from database:\n${err.stack}`));
    }
    if(!user || !user.client_id) {
        res.status(HTTPStatusCodes.NOT_FOUND).end();
        return next();
    }
    //endregion

    //region Check if Users Password Is Correct
    try {
        let isMatch = await user.isCorrectClientPassword(password);
        if(!isMatch) {
            res.status(HTTPStatusCodes.FORBIDDEN).end();
            return next();
        }
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while comparing client password:\n${err.stack}`));
    }
    //endregion


    //region Find Driver
    try {
        client = await Client.findById(user.client_id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`An error occurred while retrieving client entry from database:\n${err.stack}`));
    }
    if(!client) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).end();
        return next(new Error(`Retrieved User entry has an id listed for client_id, but client document ${user.client_id} could not be found!`));
    }
    //endregion

    //region Create Token and Return Driver Data
    let token = jwt.encode({
        _id: client._id,
        time: new Date().getTime() / 1000
    }, process.env.JWT_SIGNING_KEY);

    //region TODO: REFACTOR THIS TO ONLY RETURN TOKEN. DRIVER INFO SHOULD BE RETRIEVED IN SEPARATE ENDPOINT
    let returnObject = {
        token: token,
        clientid: client._id
    };
    //endregion


    res.status(HTTPStatusCodes.OK).json(returnObject);
    return next();
});

module.exports = router;