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
 * Module: process-cco-and-upload
 * Original Filename: index.js
 * Created by: Brandon Bush
 * Created on: 9/30/19, 1:16 PM
 */

require('dotenv').config();

const CCO_CAMPAIGN_ID = "";

async function main() {

}

main().then(() => {
    console.log("Completed script. Be good fam! -B");
    process.exit(1);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});