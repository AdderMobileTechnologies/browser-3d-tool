require("dotenv").config();

const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  user: process.env.PORTAL_DB_USER,
  pass: process.env.PORTAL_DB_PASS
};
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
const users = mongoose.createConnection(
  process.env.PORTAL_DB_HOST + "/UsersDB?authSource=admin",
  options
);
module.exports = users.model("TempUsers", TempUserSchema);
