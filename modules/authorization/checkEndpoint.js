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
 * Module: authorization/checkEndpoint
 * Original Filename: checkEndpoint.js
 * Created by: Brandon Bush
 * Created on: 10/14/19, 3:06 PM
 */

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
module.exports = function checkEndpoint(req, res, next) {
    let endpoint = req.baseUrl + req.url;

    let authorizedEndpoints = new Set(req.user.endpoints);
    if(!authorizedEndpoints.has(endpoint)) {
        res.status(HTTPStatusCodes.FORBIDDEN).json({});
        return next(new Error(`User with api key id ${req.user._id} is not authorized to utilize this endpoint.`));
    }

    return next();
};