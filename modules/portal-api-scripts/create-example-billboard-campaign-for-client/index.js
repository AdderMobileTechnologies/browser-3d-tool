require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
const dataDir = path.join(process.env.ROOT_DIR, "modules", "portal-api-scripts", "create-example-billboard-campaign-for-client","data");
const ImmutableTagLogger = require("node-common-utility").Logging.ImmutableTagLogger;
let clientID = null;

const billboardDataFiles = [
    path.join(dataDir, "billSet1.json"),
    path.join(dataDir, "billSet2.json"),
    path.join(dataDir, "billSet3.json"),
    path.join(dataDir, "billSet4.json"),
    path.join(dataDir, "billSet5.json"),
    path.join(dataDir, "billSet6.json"),
    path.join(dataDir, "billSet7.json"),
    path.join(dataDir, "billSet8.json"),
    path.join(dataDir, "billSet9.json")

];
const conversionTargetDataFile = path.join(dataDir, "convGeos.json");

const FixedPointGeo = require(path.join(process.env.ROOT_DIR, "modules", "adder-models", "clientFixedPointGeofence"));
const Geofence = require(path.join(process.env.ROOT_DIR, "modules", "adder-models", "clientGeofence"));
const Geoset = require(path.join(process.env.ROOT_DIR, "modules", "adder-models", "geoset"));
const Campaign = require(path.join(process.env.ROOT_DIR, "modules", "adder-models", "campaign"));

let savedModels = [];
let coneGeos = [];
let billGeos = [];
let convGeos = [];
let geoset = null;
let campaign = null;

async function main() {
    const logger = new ImmutableTagLogger("create-example-billboard-campaign-for-client<" + clientID + ">");
    logger.debug("Creating example billboard campaign for client: " + clientID);
    for(let dataFile of billboardDataFiles) {
        const data = fs.readFileSync(dataFile).toString("UTF-8");
        const split = data.split("\n");
        let coneJSON = JSON.parse(split[0]);
        let billJSON = JSON.parse(split[1]);
        try {
            const coneGeo = new Geofence(coneJSON);
            await coneGeo.save();
            savedModels.push(coneGeo);
            coneGeos.push(coneGeo);
            billJSON.properties.cone_id = coneGeo._id;
            const billGeo = new FixedPointGeo(billJSON);
            await billGeo.save();
            savedModels.push(billGeo);
            billGeos.push(billGeo);
        } catch(err) {
            console.log(err);
            logger.error(JSON.stringify(err, null, 4));
            await rollback(logger);
            return;
        }
    }

    logger.debug("Created cone geos: ");
    for(let geo of coneGeos) {
        logger.debug("\t" + geo._id);
    }

    logger.debug("Created bill geos: ");
    for(let geo of billGeos) {
        logger.debug("\t" + geo._id);
    }

    const convGeoSplit = fs.readFileSync(conversionTargetDataFile).toString("UTF-8").split("\n");
    for(let convGeoString of convGeoSplit) {
        try {
            const convGeoData = JSON.parse(convGeoString);
            const convGeo = new Geofence(convGeoData);
            await convGeo.save();
            convGeos.push(convGeo);
            savedModels.push(convGeo);
        } catch(err) {
            console.log(convGeoString)
            console.log(err);
            logger.error(JSON.stringify(err, null, 4));
            await rollback(logger);
            return;
        }
    }

    logger.debug("Created conversion geos: ");
    for(let cgeo of convGeos) {
        logger.debug("\t" + cgeo._id);
    }

    try {
        const cgeoset = new Geoset({
            conv_geos: convGeos.map((geo) => geo._id),
            billboards: billGeos.map((geo) => geo._id),
            __v: 0
        });
        await cgeoset.save();
        geoset = cgeoset;
        savedModels.push(cgeoset);
    } catch(err) {
        logger.error(JSON.stringify(err, null, 4));
        await rollback(logger);
        return;
    }

    logger.debug("Created geoset: " + geoset._id);

    try {
        const ccampaign = new Campaign({
            geosets: [geoset._id],
            owner: clientID,
            campaign_name: "Bean Water Brewery (DEMO)",
            campaign_url: null,
            is_paid: true,
            is_active: true,
            mo_cost: 0,
            campaign_archetype: "Billboard",
            __v: 0
        });
        await ccampaign.save();
        campaign = ccampaign;
    } catch(err) {
        console.log(err);
        logger.error(JSON.stringify(err, null, 4));
        await rollback(logger);
        return;
    }

    logger.info("Created example campaign: " + campaign._id + " for client " + clientID);
    logger.debug("Finished execution.");

    process.send('SUCCESS');
    mongoose.disconnect();
}

async function rollback(logger) {
    for(let model of savedModels) {
        try {
            await model.remove();
        } catch(err) {
            logger.error("A(n) " + err.constructor.name + " exception occurred while attempting to remove model " + model._id + " in rollback logic. This will require manual removal.");
            logger.error(JSON.stringify(err, null, 4));
        }
    }
    process.send('FAILURE');
    mongoose.disconnect();
}

process.on('message', (msg) => {
    if(msg === "start") {
        if(clientID === null) {
            process.send("FAILURE");
            return;
        }
        main();
    } else if(msg.indexOf("id: " >= 0)) {
        clientID = msg.substring(4);
    }
});