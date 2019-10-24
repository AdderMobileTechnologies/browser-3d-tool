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
 * Module: impressions-api-utility
 * Original Filename: index.js
 * Created by: Brandon Bush
 * Created on: 7/25/19 12:32 PM
 */

let impressionsAPIHost;

function __init() {
    const path = require("path");
    const readFileSync = require("fs").readFileSync;

    //region Load and Parse the Environment File
    let envLines = readFileSync(path.join(__dirname, ".env"), "utf8").replace(/\r/g, "").split("\n");
    let env = {};
    for(let line of envLines) {
        let split = line.split("=");
       if(split.length !== 2) {
           continue;
       }
        if(typeof split[1] === "function") {
            throw new Error(`impressions-api-utility > Value for environment key ${split[0]} registers as a function. This is a security flaw and is not allowed.`);
        }

        env[String(split[0])] = String(split[1]);
    }
    //endregion

    //region Verify Impressions API is valid
    if(env["IMPRESSIONS_API_HOST"] === undefined || env["IMPRESSIONS_API_HOST"] === null) {
        throw new Error(`impressions-api-utility > IMPRESSIONS_API_HOST was not specified in .env file.`);
    }
    //endregion

    impressionsAPIHost = env["IMPRESSIONS_API_HOST"];
}

__init();

/**
 * Generates a Set representation of Completed Collections from a passed array. Also performs input validation.
 * @param arr An array containing entries to convert to the Set representation.
 * @returns {{completedCollections: Set<String>, invalidCollectionEntries: Array}}
 */

function generateCompletedCollectionsSet(arr) {
    let completedCollections = new Set();
    let invalidCollectionEntries = [];
    let collectionRegex = /[0-9]{10}/;
    for(let collection of arr) {
        if(typeof collection !== "string" || !collectionRegex.test(collection)) {
            invalidCollectionEntries.push(collection);
        } else {
            completedCollections.add(collection);
        }
    }

    return {
        completedCollections: completedCollections,
        invalidCollectionEntries: invalidCollectionEntries
    };
}

module.exports = {
    Routes: {
        Host: impressionsAPIHost,
        Billboard: {
            generateBillboardRoute: "/internal/v2/billboard/generate",
            updateBillboardRoute: "/internal/v2/billboard/update"
        },
        GigEconomy: {
            updateGigEconomyRoute: "/internal/v2/gig_economy/update"
        }
    },
    Meta: {
        generateCompletedCollectionsSet
    }
};
