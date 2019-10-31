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
 * Original Filename: driverLogin.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 8/14/19, 3:18 PM
 */

const router = require('express').Router();
const jwt = require("jwt-simple");

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const User = require("adder-models").User;
const Driver = require("adder-models").Driver;

router.post("/", async function(req, res, next) {
    let user = null;
    let driver = null;
    let { email, password, hashed_pass } = req.body;

    //region Validate Input
    //TODO: REGEX TEST FOR EMAIL AND PASSWORD!
    if(!email) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({err: "INVALID_EMAIL"});
        return next(new Error(`Email was missing from request.`));
    }
    if(!password) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({err: "INVALID_PASSWORD"});
        return next(new Error(`Password was missing from request.`));
    }
    //endregion

    //region Find User
    try {
        user = await User.findOne({email: email});
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "INTERNAL_SERVER_ERROR"});
        return next(new Error(`An error occurred while retrieving user entry from database:\n${err.stack}`));
    }
    if(!user || !user.driver_id) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({err: "USER_NOT_FOUND"});
        return next();
    }
    //endregion

    //region Perform Account Upgrade, If Necessary
    if(hashed_pass) {
        try {
            let status = await user.upgradeDriverAccount(password, hashed_pass);
            if(status === false) {
                throw new Error(`hashed_pass did not match stored old_password document.`);
            }
        } catch(err) {
            res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "INTERNAL_SERVER_ERROR"});
            return next(new Error(`An error occurred while attempting password upgrade:\n${err.stack}`));
        }
    }
    //endregion

    //region Check if Users Password Is Correct
    try {
        let isMatch = await user.isCorrectDriverPassword(password);
        if(!isMatch) {
            res.status(HTTPStatusCodes.FORBIDDEN).json({err: "WRONG_PASSWORD"});
            return next()
        }
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "INTERNAL_SERVER_ERROR"});
        return next(new Error(`An error occurred while comparing driver password:\n${err.stack}`));
    }
    //endregion


    //region Find Driver
    try {
        driver = await Driver.findById(user.driver_id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "USER_IS_NOT_DRIVER"});
        return next(new Error(`An error occurred while retrieving driver entry from database:\n${err.stack}`));
    }
    if(!driver) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({err: "USER_IS_NOT_DRIVER"});
        return next(new Error(`Retrieved User entry has an id listed for driver_id, but driver document ${user.driver_id} could not be found!`));
    }
    //endregion

    //region Create Token and Return Driver Data
    let token = jwt.encode({
        _id: driver._id,
        time: new Date().getTime() / 1000
    }, process.env.JWT_SIGNING_KEY);

    //region TODO: REFACTOR THIS TO ONLY RETURN TOKEN. DRIVER INFO SHOULD BE RETRIEVED IN SEPARATE ENDPOINT
    let returnObject = {
        token: token,
        full_name: `${driver.first_name} ${driver.last_name}`,
        email: user.email,
        vehicle_year: driver.vehicle.year,
        first_name: driver.first_name,
        last_name: driver.last_name,
        insurance_carrier: driver.insurance.carrier,
        insurance_policy: driver.insurance.policy,
        phone_number: driver.phone_number,
        street_address: driver.street_address,
        state: driver.state,
        city: driver.city,
        zip: driver.zip,
        vehicle_make: driver.vehicle.make,
        vehicle_model: driver.vehicle.model,
        vehicle_trim: driver.vehicle.vtrim,
        vehicle_notes: driver.vehicle.notes
    };
    //endregion
    //endregion

    res.status(HTTPStatusCodes.OK).json(returnObject);
    return next();
});

module.exports = router;
