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
 * Original Filename: maftigerGeofence.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 9/5/19, 1:54 PM
 */

require("dotenv").config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var geofences = mongoose.createConnection(process.env.PORTAL_DB_HOST + '/GeofencesDB?authSource=admin', {
    useNewUrlParser: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

var properties = {
    STATEFP: String,
    COUNTYFP: String,
    COUNTYNS: String,
    GEOID: String,
    NAME: String,
    NAMESAD: String,
    LSAD: String,
    CLASSFP: String,
    MTFCC: String,
    FUNCSTAT: String,
    ALAND: Number,
    AWATER: Number,
    INTPTLAT: String,
    INTPTLON: String,
    population: {
        population: {
            type: Number
        },
        error_margin: {
            type: Number
        }
    },
    coverage: {
        count: {
            type: Number
        },
        v: {
            type: Number,
            default: 1
        },
        last_updated: {
            type: Number
        }
    }
};

const GeofenceSchema = new Schema({
    type: String,
    properties: {
        type: properties,
        required: true
    },
    geometry: {
        type: {
            type: String
        },
        coordinates: []
    }
}, {collection: 'MAFTIGER'});

module.exports = geofences.model("MAFTIGER", GeofenceSchema);

