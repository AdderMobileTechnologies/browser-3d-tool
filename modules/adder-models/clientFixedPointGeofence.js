require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
//const Errors = require("../validation").Errors;

const GeofenceConnection = mongoose.createConnection(process.env.PORTAL_DB_HOST + "/GeofencesDB?authSource=admin", {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});



const GeometrySchema = new Schema({
    type: {
        type: String,
        enum: ["Point"],
        default: "Point"
    },
    coordinates: {
        type: [ Number ],
        required: true
    }
}, {
    _id: false
});
const PropertiesSchema = new Schema({
    radius: {
        type: Number,
        default: null
    },
    cone_id: {
        type: String,
        default: null
    }
}, {
    _id: false
});
const GeofenceSchema = new Schema({
    type: {
        type: String,
        enum: ["Feature"],
        required: true,
        default: "Feature"
    },
    properties: {
        type: PropertiesSchema,
        required: true
    },
    geometry: {
        type: GeometrySchema,
        required: true
    }
}, {
    collection: "ClientGeofences"
});

GeofenceSchema.statics.findSingle = async function(id) {
    let geofence = null;
    try {
        geofence = await this.findOne({_id: new mongoose.Schema.ObjectId(id)});
        if(!geofence) {
            geofence = await this.findOne({_id: id});
        }
    } catch(err) {
        throw new Error(`findById(${id}):\n${err.stack}`);
    }

    if(!geofence) {
        throw new Error(`findById(${id})`);
    }

    return geofence;
};
GeofenceSchema.statics.findMultiple = async function(ids) {
    let geo;
    let id;
    let geofences = [];
    for(id of ids) {
        try {
            geo = await this.findOne({_id: new mongoose.Types.ObjectId(id)});
            if(!geo) {
                geo = await this.findOne({_id: id});
                if(!geo) {
			throw new Error("findMultiple failed");
                    //throw new Errors.DocumentNotFoundError(id, "findById(" + id + ")");
                }
            }
            geofences.push(geo);
        } catch(err) {
            //if(err instanceof Errors.DocumentNotFoundError) {
              //  throw err;
            //} else {
              //  throw new Errors.MongoRetrieveError("findById(<MULTIPLE>)", err);
            //}
	    throw new Error("findMultipleFailed");
        }
    }

    return geofences;
};

module.exports = GeofenceConnection.model("ClientFixedPointGeofence", GeofenceSchema);
