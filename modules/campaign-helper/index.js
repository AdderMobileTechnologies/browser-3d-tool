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
 * Module: campaign-helper
 * Original Filename: index.js
 * Created by: Brandon Bush
 * Created on: 7/25/19 12:55 PM
 */

const Geoset = require("adder-models").Geoset;
const ClientGeofence = require("adder-models").ClientGeofence;

/**
 * Retrieves all conversion geofences for a Campaign, returning them as an array of Mongoose ClientGeofence models.
 *
 * @param campaign A Mongoose Campaign model representing the campaign to retrieve conversion targets from.
 */
async function getConversionGeosFromCampaign(campaign = null) {
    let geosets = [];
    let conversionGeofences = [];

    //region Input Null Checks
    if(campaign === null) {
        throw new Error("No campaign mongoose model was provided");
    }
    //endregion

    //region Campaign Geoset Array Check
    if(!Array.isArray(campaign.geosets) || campaign.geosets.length === 0) {
        throw new Error(`Campaign geosets field is not an array, or is empty, value was ${campaign.geosets}`);
    }
    //endregion

    //region Gather Geosets
    for(let geosetID of campaign.geosets) {
        try {
            let result = await Geoset.findById(geosetID);
            if(result === null) {
                throw new Error(`Geoset retrieval for id ${geosetID} was successful, but no geoset could be found.`);
            }
            geosets.push(result);
        } catch(err) {
            throw err;
        }
    }
    if(geosets.length === 0) {
        throw new Error(`Geoset retrieval completed successfully, but no geosets were found.`);
    }
    //endregion

    //region Get Conversion Geofences
    for(let geoset of geosets) {
        for (let conversionID of geoset.conv_geos) {
            try {
                let result = await ClientGeofence.findById(conversionID);
                if(result === null) {
                    throw new Error(`Conversion geofence retrieval for ${conversionID} was successful, but no conversion geofence could be found.`);
                }
                conversionGeofences.push(result);
            } catch(err) {
                throw err;
            }
        }
    }
    if(conversionGeofences.length === 0) {
        throw new Error(`Conversion geofence retrieval completed successfully, but no conversion geofences could be found.`);
    }
    //endregion

    return conversionGeofences;
}

module.exports = {
    getConversionGeosFromCampaign: getConversionGeosFromCampaign
};