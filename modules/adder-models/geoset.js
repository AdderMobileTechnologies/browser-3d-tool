require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const Errors = require("./errors");

const GeosetConnection = mongoose.createConnection(process.env.PORTAL_DB_HOST + "/CampaignsDB?authSource=admin", {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const GeosetSchema = new Schema({
    owner: {
        type: String
    },
    target_geo: {
        type: String
    },
    conv_geos: {
        type: [String]
    },
    max_imp: {
        type: Number
    },
    mo_imp: {
        type: Number
    },
    freq: {
        type: Number
    },
    vehicle_count: {
        type: Number
    },
    billboards: {
        type: [String]
    }
}, {
    _v: 0,
    collection: "GeoSets"
});

GeosetSchema.statics.findSingle = async function(id) {
    let geoset = null;
    try {
        geoset = await this.findOne({_id: new mongoose.Schema.ObjectId(id)});
        if(!geoset) {
            geoset = await this.findOne({_id: id});
        }
    } catch(err) {
        throw new Errors.MongoRetrieveError("findById(" + id + ")", err);
    }

    if(!geoset) {
        throw new Errors.DocumentNotFoundError(id, "findById(" + id + ")");
    }

    return geoset;
};
GeosetSchema.statics.findMultiple = async function(ids) {
    let geo;
    let id;
    let geosets = [];
    for(id of ids) {
        try {
            geo = await this.findOne({_id: new mongoose.Types.ObjectId(id)});
            if(!geo) {
                geo = await this.findOne({_id: id});
                if(!geo) {
                    throw new Errors.DocumentNotFoundError(id, "findById(" + id + ")");
                }
            }
            geosets.push(geo);
        } catch(err) {
            if(err instanceof Errors.DocumentNotFoundError) {
                throw err;
            } else {
                throw new Errors.MongoRetrieveError("findById(<MULTIPLE>)", err);
            }
        }
    }

    return geosets;
};

module.exports = GeosetConnection.model("Geoset", GeosetSchema);
