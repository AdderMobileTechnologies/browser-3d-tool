require("dotenv").config();
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
console.log("U S I N G   adder-model :: client.js ");
console.log(
  "CONNECTION(?): ",
  process.env.PORTAL_DB_HOST + "/UsersDB?authSource=admin"
);
const users = mongoose.createConnection(
  process.env.PORTAL_DB_HOST + "/UsersDB?authSource=admin",
  {
    useNewUrlParser: true,
    useCreateIndex: true
  }
);

const PrimaryContact = new Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      default: null
    },
    business_name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: null
    },
    street_address: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    zip: {
      type: Number,
      default: null
    }
  },
  { _id: false }
);

const StripeSchema = new Schema(
  {
    customer: {
      type: Schema.Types.Mixed,
      default: {}
    },
    charges: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const ClientSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    primary_contact: {
      type: PrimaryContact,
      required: true
    },
    stripe_info: {
      type: StripeSchema
    }
  },
  {
    collection: "Clients",
    minimize: false
  }
);

module.exports = users.model("Clients", ClientSchema);
