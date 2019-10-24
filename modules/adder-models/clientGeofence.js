require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const Errors = require("./errors");

const GeofenceConnection = mongoose.createConnection(process.env.PORTAL_DB_HOST + "/GeofencesDB?authSource=admin", {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const GeometrySchema = new Schema({
    type: {
        type: String,
        enum: ["LineString"],
        default: "LineString"
    },
    coordinates: {
        type: [ [ Number ] ],
        required: true
    }
}, {
    _id: false
});

const PropertiesSchema = new Schema({
    asset_name: {
        type: String,
        default: undefined
    }
}, {
    _id: false
});

const GeofenceSchema = new Schema({
    type: {
        type: String,
        enum: ["Feature"],
        required: true
    },
    properties: {
        type: PropertiesSchema,
        default: {}
    },
    geometry: {
        type: GeometrySchema,
        required: true
    }
}, {
    collection: "ClientGeofences"
});


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
                    throw new Errors.DocumentNotFoundError(id, "findById(" + id + ")");
                }
            }
            geofences.push(geo);
        } catch(err) {
            if(err instanceof Errors.DocumentNotFoundError) {
                throw err;
            } else {
                throw new Errors.MongoRetrieveError("findById(<MULTIPLE>)", err);
            }

        }
    }

    return geofences;
};

module.exports = GeofenceConnection.model("ClientGeofences", GeofenceSchema);
