console.log("adder-models:temUser: spot1");
require("dotenv").config();

const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  user: process.env.PORTAL_DB_USER,
  pass: process.env.PORTAL_DB_PASS
};
console.log("adder-models:temUser: spot2");
const TempUserSchema = new Schema(
  {
    verification_token: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: new Date()
    }
  },
  {
    collection: "TempUsers"
  }
);
console.log("adder-models:temUser: spot3");
const users = mongoose.createConnection(
  process.env.PORTAL_DB_HOST + "/UsersDB?authSource=admin",
  options
);
console.log("adder-models:temUser: spot4");
module.exports = users.model("TempUsers", TempUserSchema);
console.log("adder-models:temUser: spot5");
