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
 * Original Filename: postRoute.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 8/18/19, 3:14 PM
 */

const router = require('express').Router();
const passport = require('passport');
const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;
const Campaign = require("adder-models").Campaign;

router.post("/", passport.authenticate("DriverStrategy", {session : false}, null), async function(req, res, next) {
  console.log(req.body);
  res.status(200).end();
  return next();
});

module.exports = router;
