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
 * Original Filename: index.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 7/31/19, 3:00 PM
 */

const router = require('express').Router();

router.use('/billboard_route', require("./billboardRoute"));
router.use('/normal_route', require("./normalRoute"));
router.use('/ip_data', require("./ipData"));
module.exports = router;