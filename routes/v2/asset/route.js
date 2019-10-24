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
 * Module: /v2/asset/route GET
 * Original Filename: route.js
 * Created by: Brandon Bush
 * Created on: 9/13/19, 9:38 AM
 */

const router = require('express').Router();
const passport = require('passport');

const HTTPStatusCodes = require("node-common-utility").Constants.HTTPStatusCodes;

const objectIDRegex = require("node-common-utility").Regex.mongoDBObjectIDRegex;

const Route = require("adder-models").Route;

router.get("/:id",  passport.authenticate("ClientStrategy", { session : false }, null), async function (req, res, next) {

    const rsl = Number(req.query.rsl);
    const id = String(req.params.id);

    let geoJsonRoute;

    //region Validate Parameters
    if(!id) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "MISSING_QUERY_PARAMETER: id"
        });
        return next(new Error(`Request missing url ':id' parameter.`));
    }

    if(!objectIDRegex.test(id)) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "INVALID_QUERY_PARAMETER: id"
        });
        return next(new Error(`Requested asset _id ${id} failed ObjectID regex test.`));
    }

    if(!rsl) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "MISSING_QUERY_PARAMETERS: rsl"
        });
        return next(new Error(`Request missing query parameters 'rsl'.`));
    }

    if(Number.isNaN(rsl) || rsl < 1 || rsl > 10) {
        res.status(HTTPStatusCodes.BAD_REQUEST).json({
            err: "INVALID_QUERY_PARAMETER: rsl"
        });
        return next(new Error(`Passed query parameter 'rsl' has invalid value of ${rsl}`));
    }
    //endregion

    //region Grab the Route
    let route = null;

    try {
        route = await Route.findById(id);
    } catch(err) {
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).json({
            err: "INTERNAL_SERVER_ERROR"
        });
        return next(new Error(`An error occurred while attempting to retrieve route ${id}:\n${err.stack}`));
    }
    //endregion

    //region 404 If The Document Doesn't Exist
    if(route === null) {
        res.status(HTTPStatusCodes.NOT_FOUND).json({
            err: `Requested asset ${id} could not be found.`
        });
        return next(new Error(`Requested route ${id} does not exist in database.`));
    }
    //endregion

    //region Quick Return Billboard Routes
    if(route.type && route.type === "Billboard") {
        // Some Billboard Routes may have "LineString" as their geometry type, when they should really be polygons.
        // The following block of code will convert them over to "Polygon" if needed.

        let coneGeometry = route.cones.geometry;
        if(coneGeometry.type === "LineString") {
            coneGeometry = {
                type: "Polygon",
                coordinates: [ coneGeometry.coordinates ]
            };
        }

        geoJsonRoute = {
            type: "Feature",
            properties: {
                _id: route._id,
                ro: route.ro,
                base_point: coneGeometry.coordinates[0][0]
            },
            geometry: coneGeometry
        };

        res.status(HTTPStatusCodes.OK).json(geoJsonRoute);
        return next();
    }
    //endregion

    //region Slim Down the Original Points Array
    // Start at -1 to simplify the loop logic and ensure the start point is always included in the slimmed down array.
    let slimmedPoints = route.pts;
    if(rsl > 1) {
        let counter = -1;
        let lastPoint = slimmedPoints[slimmedPoints.length - 1];
        slimmedPoints = slimmedPoints.filter(() => {
            counter++;
            return counter % rsl === 0;
        });

        if(slimmedPoints[slimmedPoints.length - 1] !== lastPoint) {
            slimmedPoints.push(lastPoint);
        }
    }
    //endregion

    //region Create GeoJSON Representation
    let geoJsonCoordinates = slimmedPoints.map((value) => {
        return value.location.coordinates;
    });

    let timestampsArray = slimmedPoints.map((value) => {
        return value.properties.ts;
    });

    geoJsonRoute = {
        type: "Feature",
        properties: {
            _id: route._id,
            ro: route.ro,
            timestamps: timestampsArray
        },
        geometry: {
            type: "LineString",
            coordinates: geoJsonCoordinates
        }
    };
    //endregion

    res.status(HTTPStatusCodes.OK).json(geoJsonRoute);
    return next();
});

module.exports = router;