require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const Errors = require("./errors");

const CampaignConnection = mongoose.createConnection(process.env.PORTAL_DB_HOST + '/CampaignsDB?authSource=admin',{
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const ServicesEnabledSchema = new Schema({
    ip_data: {
        type: new Schema({
            frontend: {
                type: Boolean,
                default: false
            },
            csv: {
                type: Boolean,
                default: false
            }
        }),
        required: false
    }
}, {
    _id: false,
    strict: false
});
const CampaignSchema = new Schema({
    owner: {
        type: String,
        required: true
    },
    campaign_name: {
        type: String
    },
    campaign_url: {
        type: String
    },
    utc_start: {
        type: Number
    },
    utc_duration: {
        type: Number
    },
    is_paid: {
        type: Boolean
    },
    is_active: {
        type: Boolean
    },
    setup_cost: {
        type: Number
    },
    mo_cost: {
        type: Number
    },
    total_vehicles: {
        type: Number
    },
    body_ad_type: {
        type: String,
        enum: ["Full Wrap", "Side Wrap", "Door", "Magnet", "None", null]
    },
    window_ad_type: {
        type: String,
        enum: ["Rear", "None", null]
    },
    body_image_path: {
        type: String
    },
    window_image_path: {
        type: String
    },
    campaign_archetype: {
        type: String,
        enum: ["Advantage", "Fleet", "Billboard"]
    },
    geosets: {
        type: [String]
    },
    discount_code_applied: {
        type: String
    },
    services_enabled: {
        type: ServicesEnabledSchema,
        required: false
    }
}, {
    strict: false
});

CampaignSchema.statics.findWithNullCheck = async function(id) {
    let campaign = null;
    try {
        campaign = await this.findOne({_id: new mongoose.Types.ObjectId(id)});
        if(!campaign) {
            campaign = await this.findOne({_id: id});
        }
    } catch(err) {
        throw new Errors.MongoRetrieveError({_id: id}, err);
    }

    if(!campaign) {
        throw new Errors.DocumentNotFoundError(id, {_id: id});
    }

    return campaign;
};

module.exports = CampaignConnection.model("Campaigns", CampaignSchema, "Campaigns");