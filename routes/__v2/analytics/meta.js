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
 * Module: /v2/analytics/meta
 * Original Filename: meta.js
 * Created by: Brandon Bush
 * Created on: 9/16/19, 4:30 PM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;

const Campaign = require("adder-models").Campaign;
const Geoset = require("adder-models").Geoset;
const Route = require("adder-models").Route;

router.get("/", passport.authenticate("ClientStrategy", {session: false}, null), async function (req, res, next) {
    let campaigns = [];
    try {
        campaigns = await Campaign.find({owner: req.user._id}).lean();
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({});
        return next(new Error(`An error occurred during campaign retrieval:\n${err.stack}`));
    }

    if(campaigns === null || campaigns.length === 0) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({});
        return next();
    }

    // Get geosets, tagging them with campaign owner
    let taggedCampaigns = [];
    for(let campaign of campaigns) {

        // Get the Geoset and Geofence IDs
        let taggedGeosets = [];
        for(let geosetID of campaign.geosets) {
            try {
                let geoset = await Geoset.findById(geosetID).lean();
                if(geoset === null) {
                    throw new Error(`Geoset ${geosetID} does not exist!`);
                }
                geoset.campaign_owner = campaign._id;
                delete geoset.owner;
                delete geoset.__v;
                taggedGeosets.push(geoset);
            } catch(err) {
                const logger = new ImmutableTagLogger(req.url);
                logger.error(`An error occurred while retrieving geoset ${geosetID}:\n${err.stack}`);
            }
        }
        campaign.geosets = taggedGeosets;

        // Get the route IDs
        let routeIds = [];
        try {
            routeIds = (await Route.find({"ro.cref": campaign._id}, {_id: true}).lean()).map((value) => {
                return value._id
            });
            if(routeIds === null) {
                throw new Error(`Retrieved routes for ${campaign._id} was null!`);
            }
        } catch(err) {
            const logger = new ImmutableTagLogger(req.url);
            logger.error(`An error occurred while retrieving routes for campaign ${campaign._id}:\n${err.stack}`);
            continue;
        }

        campaign.routes = routeIds;

        // Push the tagged campaign that will be returned
        taggedCampaigns.push(campaign);
    }

    res.status(HTTPStatusCodes.OK).json(taggedCampaigns);
    return next();
});

module.exports = router;