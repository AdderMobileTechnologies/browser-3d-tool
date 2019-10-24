const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connection = mongoose.createConnection(process.env.PORTAL_DB_HOST + "/APIDB?authSource=admin", {
    useNewUrlParser: true,
    useCreateIndex: true,
    user: String(process.env.PORTAL_DB_USER),
    pass: String(process.env.PORTAL_DB_PASS)
});

const APIKeySchema = new Schema({
    _id: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    authorized: {
        type: Boolean,
        require: true,
        default: false
    },
    endpoints: {
        type: [ String ],
        require: true,
        default: []
    }
}, {
    collection: "APIKeys"
});

module.exports = connection.model("APIKey", APIKeySchema);
