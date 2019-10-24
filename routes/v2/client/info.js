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
 * Module: /v2/client/info
 * Original Filename: info.js
 * Created by: Brandon Bush
 * Created on: 9/18/19, 6:28 PM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPCodes = require("node-common-utility").Constants.HTTPStatusCodes;

router.get("/", passport.authenticate("ClientStrategy", { session: false }, null), async function (req, res, next) {
    res.status(HTTPCodes.OK).json({
        email: req.user.email,
        first_name: req.user.primary_contact.first_name,
        last_name: req.user.primary_contact.last_name,
        business_name: req.user.primary_contact.business_name
    });

    return next();
});

module.exports = router;