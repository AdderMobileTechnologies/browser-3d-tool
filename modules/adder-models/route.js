require("dotenv").config();
const Mongoose = require('mongoose');
const Schema = require("mongoose").Schema;

const routesConnection = Mongoose.createConnection(process.env.PORTAL_DB_HOST + '/RoutesDB?authSource=admin', {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

//region RO Schema
const RouteOverviewSchema = new Schema({
    ti: {
        type: Number,
        default: 0
    },
    ui: {
        type: Number,
        default: 0
    },
    ei: {
       type: Number,
       default: 0
    },
    tc: {
        type: Number,
        default: 0
    },
    uc: {
        type: Number,
        default: 0
    },
    tp: {
        type: Number,
        default: 0
    },
    unique_sg_devices: {
        type: Number,
        default: 0
    },
    tdt: {
        type: Number,
        default: 0
    },
    sid: {
        type: String,
        default: null
    },
    cref: {
        type: String,
        required: false
    },
    dref: {
        type: String,
        required: false
    },
    sts: {
        type: Number,
        required: true
    },
    ets: {
        type: Number,
        required: true
    },
    dst: {
        type: Number,
        required: true
    },
	ec: {
		type: Number,
		default: 0
	}
}, {
    _id: false,
	strict: false
});
//endregion

//region Cone Schemas
const ConePropertiesSchema = new Schema({
    asset_name: {
        type: String
    }
}, {
    _id: false,
    strict: false
});

const ConeLocationSchema = new Schema({
    type: {
        type: String,
        enum: ["Polygon"]
    },
    coordinates: {
        type: [ [ [ Number ] ] ],
    }
}, {
    _id: false,
    strict: false
});

const ConeSchema = new Schema({
    _id: {
        type: String,
    },
    type: {
        type: String,
        enum: ["Feature"]
    },
    properties: {
        type: ConePropertiesSchema,

    },
    geometry: {
        type: ConeLocationSchema,

    }
}, {
    strict: false
});

//endregion

//region Point Schemas
const PointLocationSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["Point"]
    },
    coordinates: {
        type: [ Number ],
        required: true
    }
}, {
    _id: false
});

const PointPropertiesSchema = new Schema({
    ts: {
        type: Number,
        required: true
    },
    spd: {
        type: Number
    },
    ber: {
        type: Number
    },
    alt: {
        type: Number
    },
    bat: {
        type: Number,
        required: false
    },
    lex: {
        type: Boolean,
        required: false
    },
    rad: {
        type: Number,
        required: false
    },
    rsl: {
        type: Number,
        required: false
    }
}, {
    _id: false
});

const PointSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["Feature"]
    },
    properties: {
        type: PointPropertiesSchema,
        required: true
    },
    location: {
        type: PointLocationSchema,
        required: true
    }

}, {
    _id: false
});
//endregion

const ipSchema = new Schema({
    ad_id: {
        type: String
    },
    ipv4: {
        type: [String]
    },
    ipv6: {
        type: [String]
    }
}, {
    _id: false,
    strict: false
});
const RouteSchema = new Schema({
    dv: {
        type: String,
        required: true,
        enum: ["v2"]
    },
    type: {
        type: String,
        enum: [ "Billboard", "Fleet", "Advantage", "none"],
        required: false
    },
    last_updated: {
        type: Number
    },
    created: {
        type: Number
    },
    idb_complete: {
        type: Boolean
    },
    ro: {
        type: RouteOverviewSchema
    },
    pts: {
        type: [ PointSchema ]
    },
    cones: {
        type: ConeSchema,
        required: false,
        strict: false
    },
    ip_data: {
        type: [ipSchema],
        required: false
    },
    unique_ids: {
        type: [String],
        required: false
    }
}, {
    collection: "Routes",
    strict: false
});


RouteSchema.pre("save", function (next) {
    if(this.isNew) {
        this.created = new Date().getTime() / 1000;
    }
    this.last_updated = new Date().getTime() / 1000;

    return next();
});

RouteSchema.statics.findMultipleByOwner = async function(owner) {
    let route = [];
    try {
        route = await this.find({"ro.cref": owner});
        if(route === null) {
            throw new Error("Route lookup completed successfully, but route lookup returned null!");
        }
    } catch(err) {
	    throw err;
    }

    return route;
};

module.exports = routesConnection.model('Routes', RouteSchema);
