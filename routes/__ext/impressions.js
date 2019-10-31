const router = require('express').Router();
const MongooseHelper = require('../../utility/mongooseHelper');
const util = require('util');

let routeCounter = 0;

const ADWAY_IDENTIFIER = "7FC22C4A99EF959C2290A8A6EB51DBF0";
const ADWAY_APP_CODE = "76DDA4CB68ED5C4D37AA5B9720DF7DA6";

router.post('/route', async function(req, res) {

    if(typeof req.query.appid === 'undefined' || !req.query.appid) {
        return res.status(403).json({err: "INVALID_APP_ID"});
    }

    if(typeof req.query.appcode === 'undefined' || !req.query.appcode) {
        return res.status(403).json({err: "INVALID_APP_CODE"});
    }

    //TODO: GENERALIZE THIS TO RESTRICT ACCESS TO ANY NUMBER OF ACCOUNTS
    const identifier = String(req.query.appid);
    if(identifier !== ADWAY_IDENTIFIER) {
        return res.status(403).json({err: "INVALID_APP_ID"});
    }

    const code = String(req.query.appcode);
    if(code !== ADWAY_APP_CODE) {
        return res.status(403).json({err: "INVALID_APP_ID"});
    }

    //region Validate Body
    let bodyValidationErrors = [];
    if(typeof req.body === 'undefined' || !req.body) {
        bodyValidationErrors.push({msg: "NO_BODY_PROVIDED"});
    }

    if(!Array.isArray(req.body)) {
        bodyValidationErrors.push({msg: "BODY_NOT_ARRAY"});
    }

    if(req.body.length === 0) {
        bodyValidationErrors.push({msg: "NO_POINTS_PROVIDED"});
    }

    if(bodyValidationErrors.length > 0) {
        return res.status(400).send({err: "REQUEST_VALIDATION_ERROR", msg: bodyValidationErrors});
    }
    //endregion

    //region Validate GeoJson Points
    let invalidPoints = [];
    let validPoints = [];
    for(let point of req.body) {
        let pointValidationErrors = [];
        if(typeof point.type !== 'string' || point.type !== "Feature") {
            pointValidationErrors.push("INVALID_TYPE");
        }

        if(typeof point.properties === 'undefined' || !point.properties ||
            typeof point.properties.timestamp === 'undefined' || !point.properties.timestamp  ||
            typeof point.properties.rad === 'undefined' || point.properties.rad < 5.0 || point.properties.rad > 5280.0 ||
            typeof point.properties.rsl === 'undefined' || !point.properties.rsl || point.properties.rsl < 0 || point.properties.rsl > 60
        ) {
            pointValidationErrors.push("INVALID_PROPERTIES");
        }

        if(typeof point.location === 'undefined' || !point.location ||
            typeof point.location.type === 'undefined' || !point.location.type || point.location.type !== "Point" ||
            typeof point.location.coordinates === 'undefined' || !point.location.coordinates ||
            !Array.isArray(point.location.coordinates) || point.location.coordinates.length !== 2 ||
            typeof point.location.coordinates[0] !== "number" || point.location.coordinates[0] < -180.0 || point.location.coordinates[0] > 180.0 ||
            typeof point.location.coordinates[1] !== "number" || point.location.coordinates[1] < -90.0 || point.location.coordinates[1] > 90.0) {
            pointValidationErrors.push("INVALID_LOCATION");
        }

        if(pointValidationErrors.length > 0) {
            point.properties.err = pointValidationErrors;
            invalidPoints.push(point);
        } else {
            validPoints.push(point);
        }
    }

    if(validPoints.length === 0) {
        return res.status(400).send({err: "NO_VALID_POINTS", invalidPoints: invalidPoints})
    }

    //endregion


    let queryResult = null;
    try {
        queryResult = await MongooseHelper.extRetrieveImpressionsFromRoute(validPoints);
    } catch(err) {
        return res.status(500).send(util.inspect(err));
    }

    let returnPoints = [];
    for(let result of queryResult.results) {
        let point = result.point;
        point.properties.imp = result.imp.length;
        returnPoints.push(point)
    }

    return res.status(200).send({result: returnPoints, err: invalidPoints})

});

module.exports = router;
