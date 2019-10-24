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
 * Original Filename: coupon.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 9/5/19, 1:49 PM
 */

require("dotenv").config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coupons = mongoose.createConnection(process.env.PORTAL_DB_HOST + '/ValuesDB?authSource=admin', {
    useNewUrlParser: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const CouponSchema = new Schema({
    coupon_id: {
        type: String,
        required: true
    },
    setup_percentage_discount: {
        type: Number
    },
    setup_amount_discount: {
        type: Number
    },
    monthly_percentage_discount: {
        type: Number
    },
    monthly_amount_discount: {
        type: Number
    },
    description: {
        type: String,
        required: true
    },
    display: {
        type: String
    },
    restricted_to: {
        type: [String],
        default: []
    }
}, { collection: "Coupons"});

module.exports = coupons.model("Coupon", CouponSchema);