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
 * Module: v2/driver/campaign_info
 * Original Filename: campaignInfo.js
 * Created by: Brandon Bush
 * Created on: 8/17/19, 1:04 PM
 */
const router = require('express').Router();
const passport = require('passport');
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const Campaign = require("adder-models").Campaign;

router.get("/",
    passport.authenticate("DriverStrategy", {session : false}, null),
    async function(req, res, next) {
        let campaign_id = req.user.current_campaign;
        let campaign = null;

        //region Check the Input
        if(campaign_id === undefined || campaign_id === null) {
            res.status(HTTPStatusCodes.OK).json({
                type: "NONE",
                name: "No Campaign",
                id: ""
            });
            return next();
        }
        //endregion

        //region Get the Campaign
        try {
            campaign = await Campaign.findById(campaign_id).lean();
        } catch(err) {
            res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
            return next(new Error(`An error occurred while retrieving campaign ${campaign_id} from database:\n${err.stack}`));
        }
        if(campaign === null) {
            res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
            return next(new Error(`Campaign retrieval completed successfully, but campaign ${campaign_id} was not found!`));
        }
        //endregion

        //region Return the Results
        res.status(HTTPStatusCodes.OK).json({
            type: campaign.campaign_archetype,
            name: campaign.campaign_name,
            id: campaign._id
        });
        return next();
        //endregion
    });

module.exports = router;
