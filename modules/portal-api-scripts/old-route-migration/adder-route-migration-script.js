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
 * Original Filename: adder-route-migration-script.js
 * Created by: <INSERT_YOUR_NAME>
 * Created on: 7/30/19, 11:10 AM
 */

require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const Route = require(process.env.ROOT_DIR + "/modules/adder-models").Route;
const findRoutes = function() {
  return new Promise(async (resolve, reject) => {
    let connectedClient;
    let docs = [];

    const query = {
      "ro.cref": { $exists: false }
    };
    const url = String("mongodb://localhost:27017");
    const dbName = String("RoutesDB");
    const collectionName = "Routes";
    const client = new MongoClient(url);

    try {
      connectedClient = await client.connect();
    } catch (err) {
      console.log(err);
      return await client.close();
    }

    try {
      docs = await connectedClient
        .db(dbName)
        .collection(collectionName)
        .find(query)
        .toArray();
    } catch (err) {
      console.log(err);
      return await client.close();
    }
    //endregion
    try {
      client.close();
    } catch (err) {
      console.log("Debug: " + err);
    }
    return resolve(docs);
  });
};

async function main() {
  let results;
  try {
    results = await findRoutes();
  } catch (err) {
    console.error(err);
    return false;
  }

  if (results === undefined || results === null) {
    throw new Error("Results returned were undefined or null!");
  }
  count = 0;
  //convert results into new data structure as json object
  console.log("Building new data format from old structures...");
  var data = {};
  for (let rtobj in results) {
    var pts = [];
    var route = results[rtobj].pings;
    for (let ping in route) {
      timestamp = route[ping].timestamp;
      speed = route[ping].speed;
      bearing = route[ping].bearing;
      alt = route[ping].alt;
      battery = route[ping].battery;
      //lng = route[ping].lng;
      //lat = route[ping].lat;
      var coordinates = [route[ping].lng, route[ping].lat];
      const pnt = {
        type: "Feature",
        properties: {
          ts: timestamp,
          spd: speed,
          ber: bearing,
          alt: alt,
          bat: battery,
          rad: 150,
          rsl: 240,
          imp: {}
        },
        location: {
          coordinates,
          type: "Point"
        }
      };
      //add point to pts
      pts[ping] = pnt;
      //console.log(pnt);
    }

    start_timestamp = results[rtobj].start_timestamp;
    end_timestamp = results[rtobj].end_timestamp;
    driver_ref = results[rtobj].driver_ref;
    campaign_ref = results[rtobj].campaign_ref;
    session_id = results[rtobj].session_id;
    created = new Date().getTime();

    var obj = {
      ro: {
        ti: 0,
        ui: 0,
        tc: 0,
        uc: 0,
        tdt: 0,
        sid: session_id,
        cref: campaign_ref,
        dref: driver_ref,
        sts: start_timestamp,
        ets: end_timestamp,
        dst: 0
      },
      pts: pts,
      dv: "v2",
      last_updated: created,
      cones: {},
      created: created
    };
    //Object.assign(obj.pts, pts);
    count++;
    data[rtobj] = obj;
  }

  //console.log(data[pts]);
  //console.log(data);
  //return data;

  // Example object
  console.log(
    "Success!  " + count + " entries converted.  Pushing to database..."
  );

  // Create the "mongoose model"

  for (let rts in data) {
    const model = new Route(data[rts]);
    console.log("Pushing Entry " + rts);

    // Save

    try {
      await model.save();
      console.log("Entry " + rts + " Done!");
    } catch (err) {
      // If the save failed, usually due to validation error, we log the error here and continue to the next route.
      console.error(err);
      console.log(err);
    }
  }

  return data;
}

main()
  .then(result => {
    console.log("Migration Finished");
    var fs = require("fs");
    fs.writeFile("data.txt", JSON.stringify(result, null, 2), "utf-8", err2 => {
      if (err2) console.log(err2);
    });
    //console.log(result[0].pts[0].location);
    console.log("Done.  Wrote conversion to data.txt for debugging.");
  })
  .catch(err => {
    console.error(err);
  });

// mongorestore --port 27017 folder-name-to-restore
