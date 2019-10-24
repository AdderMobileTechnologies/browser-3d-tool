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
 * Module: migrate-fixed-point-billboards-to-single-doc-billboards
 * Original Filename: index.js
 * Created by: Brandon Bush
 * Created on: 9/11/19, 2:21 PM
 */

const Campaign = require("adder-models").Campaign;
const Geoset = require("adder-models").Geoset;
const ClientFixedPointGeofence = require("adder-models").ClientFixedPointGeofence;
const ClientGeofence = require("adder-models").ClientGeofence;
const Billboard = require("adder-models").Billboard;
const Route = require("adder-models").Route;
async function main() {
    // First get all campaigns
    let campaigns = [];

    try {
        console.log("Retrieving billboard campaigns.");
        campaigns = await Campaign.find({campaign_archetype: "Billboard"});
        console.log(`Retrieved ${campaigns.length} billboard campaigns.`);
    } catch(err) {
        throw err;
    }

    for(let campaign of campaigns) {
        try {
            await processCampaign(campaign);
        } catch(err) {
            console.error(new Error(`An error occurred while processing campaign ${campaign._id}:\n${err.stack}`));
        }
    }
}

async function processCampaign(campaign) {
    // Get the geosets
    console.log(`Processing campaign ${campaign._id}`);
    let geosets = [];
    for(let geosetID of campaign.geosets) {
        try {
            let geoset = await Geoset.findById(geosetID);
            if(geoset === null) {
                throw new Error(`Could not find geoset ${geosetID}`);
            }
            geosets.push(geoset);
        } catch(err) {
            throw err;
        }
    }

    if(geosets.length === 0) {
        throw new Error(`Geoset retrieval completed successfully, but no geosets could be found!`);
    }

    for(let geoset of geosets) {
        try {
            await processGeoset(geoset)
        } catch(err) {
            throw err;
        }
    }
}

async function processGeoset(geoset) {
    console.log(`Processing geoset ${geoset._id}`);

    let fixedPointGeofences = [];

    if(geoset.billboards === null || geoset.billboards === undefined || geoset.billboards.length === 0) {
        throw new Error(`Geoset ${geoset._id} does not contain a billboards array, or billboards array is empty!`);
    }

    for(let id of geoset.billboards) {
        try {
            let fixedPointGeofence = await ClientFixedPointGeofence.findById(id);
            if(fixedPointGeofence === null) {
                throw new Error(`Could not find fixed point geofence ${id}`);
            }
            fixedPointGeofences.push(fixedPointGeofence);
        } catch(err) {
            throw err;
        }
    }

    if(fixedPointGeofences.length === 0) {
        throw new Error(`Fixed point geofence retrieval completed successfully, but no fixed point geofences could be found!`);
    }

    let oldConesToRemove = [];
    let oldFPToRemove = [];
    let newBillboardsToSave = [];
    let routesToSave = [];

    for(let fixedPointGeofence of fixedPointGeofences) {
        try {
            let result = await processFixedPointGeofence(fixedPointGeofence);

            // Now we have original fixed point, original cone, and new billboard document. Lets set the geoset owner now
            let newBillboard = result.billboard;
            newBillboard.properties.geoset_owner = geoset._id;
            const billboardModel = new Billboard(newBillboard);
            billboardModel.validate();

            // Alright, so the new billboard is created and validated, but don't update yet! Need to do that all in one go, just in case something goes wrong.
            // Push to an array outside of this loop, we will go through and save everything after this.
            oldConesToRemove.push(result.cone);
            oldFPToRemove.push(result.fixedPointGeofence);
            newBillboardsToSave.push(billboardModel);

            // Billboard routes have a reference to original cones, so we need to update those as well.
            let routes = await Route.find({"cones._id": result.cone._id});
            for(let route of routes) {
                route["cones"]["_id"] = billboardModel["_id"];
                route["cones"]["properties"] = billboardModel["properties"];
                routesToSave.push(route);
            }
        } catch(err) {
            throw err;
        }
    }

    // Okay, now we update the billboard ids in the geoset itself to reference the new billboards.
    geoset.billboards = newBillboardsToSave.map((value) => {
        return value._id;
    });


    // Alright, now we save everything (BE SURE YOU BACKUP THE ENTIRE DATABASE BEFORE YOU DO THIS, YOU CAN REALLY SCREW STUFF UP IF NOT CAREFUL!!!!!!!!)
    try {
        for(let billboard of newBillboardsToSave) {
            await billboard.save();
            console.log("Successfully saved billboard", billboard._id);
        }

        await geoset.save();
        console.log("Successfully saved geoset", geoset._id);

        for(let route of routesToSave) {
            await route.save();
            console.log("Successfully saved updated route", route._id);
        }
    } catch(err) {
        throw err;
    }

    // Now, if we're here, the new billboards have been saved, and the geoset billboard ids have been appropriately updated. Now, we remove the old documents

        for(let old of oldConesToRemove) {
            try {
                await old.remove();
                console.log("Successfully removed old cone", old._id);
            } catch(err) {
                throw new Error(`An error occurred while removing old cone geofence ${old._id}. This is not fatal but contributes to DB Pollution. Please remove asap:\n${err.stack}`);
            }
        }

        for(let old of oldFPToRemove) {
            try {
                await old.remove();
                console.log("Successfully removed old FPGeofence", old._id);
            } catch(err) {
                throw new Error(`An error occurred while removing old FP geofence ${old._id}. This is not fatal but contributes to DB Pollution. Please remove asap:\n${err.stack}`);
            }
        }
}

async function processFixedPointGeofence(fixedPointGeofence) {
    console.log(`Processing fixed point geofence ${fixedPointGeofence._id}`);

    // We have the fixed point geofence, now we need the cone.

    let cone = null;

    try {
        cone = await ClientGeofence.findById(fixedPointGeofence.properties.cone_id);
    } catch(err) {
        throw err;
    }

    // Now we have the cone, let's combine everything into the new schema (Just data object, not actual model yet!)

    let geometry = {};
    if(cone.geometry.type === "LineString") {
        geometry = {
            type: "Polygon",
            coordinates: [ cone.geometry.coordinates ]
        };
    } else {
        geometry = cone.geometry;
    }

    let newBillboard = {
        type: "Feature",
        properties: {
            asset_name: "",
            base_point: fixedPointGeofence.geometry.coordinates,
            geoset_owner: ""
        },
        geometry: geometry
    };

    return {
        fixedPointGeofence: fixedPointGeofence,
        cone: cone,
        billboard: newBillboard
    };

}

main().then(() => {
    console.log("All done!")
}).catch((err) => {
    console.error(err);
});