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
 * Module: adder-models/Billboard
 * Original Filename: billboard.js
 * Created by: Brandon Bush
 * Created on: 9/11/19, 2:12 PM
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connection = mongoose.createConnection(process.env.PORTAL_DB_HOST + "/GeofencesDB?authSource=admin", {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const BillboardPropertiesSchema = new Schema({
    asset_name: {
        type: String,
        default: "",
        validate: {
            validator: (value) => {
                if (value === undefined || value === null) {
                    return false;
                }
                return typeof value === "string";
            },
            message: "{VALUE} must be a String"
        }
    },
    base_point: {
        type: [ Number ],
        required: true,
        default: []
    },
    geoset_owner: {
        type: String,
        required: false,
        default: ""
    }
}, {
    _id: false
});

const BillboardGeometrySchema = new Schema({
    type: {
        type: "String",
        required: true,
        enum: ["Polygon"]
    },
    coordinates: {
        type: [ [ [ Number ] ] ],
        required: true
    }
}, {
    _id: false
});

const BillboardSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["Feature"]
    },
    properties: {
        type: BillboardPropertiesSchema,
        required: true
    },
    geometry: {
        type: BillboardGeometrySchema,
        required: true
    }
}, {
    collection: "ClientGeofences"
});

module.exports = connection.model("Billboard", BillboardSchema);
