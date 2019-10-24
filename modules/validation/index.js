/**
 * Contains validation methods for the various types of data the Adder system deals with. Please see each associated
 * namespace for more information.
 *
 * @module Validation
 * @author Brandon Bush
 */

const Errors = require("./errors");
const Mongo = require("./mongo");
const Time = require("./time");

module.exports = {
    Errors: Errors,
    Time: Time,
    Mongo: Mongo
};