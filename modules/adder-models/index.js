const Campaign = require("./campaign");
const ClientFixedPointGeofence = require("./clientFixedPointGeofence");
const ClientGeofence = require("./clientGeofence");
const Geoset = require("./geoset");
const Route = require("./route");
const Client = require("./client");
const User = require("./user");
const Driver = require("./driver");
const TempUser = require("./tempUser");
const APIKey = require("./apiKey.js");

module.exports = {
    APIKey,
    Billboard: require("./billboard"),
    Campaign,
    ClientFixedPointGeofence,
    ClientGeofence,
    Coupon: require("./coupon"),
    Driver,
    MAFTIGERGeofence: require("./maftigerGeofence"),
    TempUser,
    Geoset,
    Route,
    Client,
    User
};
