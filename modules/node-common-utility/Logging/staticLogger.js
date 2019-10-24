/*
 * Copyright (C) 2019 Adder Mobile Technologies, Inc.
 * All Rights Reserved
 *
 * This file and its contents are the exclusive property of Adder Mobile Technologies, Inc.
 * Only approved personal are authorized to view, modify, distribute, discuss, execute, or otherwise
 * utilize or manipulate this file in any capacity, including but not limited to personal or commercial
 * use, distribution via any combination of physical or digital means, and physical reproduction
 * of this files contents or any of its associated metadata.
 *
 * Any questions may be directed to Brandon Bush<b.bush@adder.io>, CTO
 *
 * Project: adder-logger
 * Module: adder-logger
 * Original Filename: index.js
 * Created by: Brandon Bush
 * Created on: 7/19/19 1:58 AM
 */


//region Imports
require("dotenv").config();
const winston = require("winston");
//endregion


//region Transports
const __consoleTransport = new winston.transports.Console({
    level: process.env.LOGGER_LEVEL,
    silent: false,
    stderrLevels: ["error", "warn"]
});
//endregion

//region General Utility
const __generateLocalTimestamp = winston.format((info) => {
    const now = new Date();
    info.timestamp = `${now.getFullYear()}-` +
        `${(now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)}-` +
        `${now.getDate() < 10 ? "0" + now.getDate() : now.getDate()}T` +
        `${now.getHours() < 10 ? "0" + now.getHours() : now.getHours()}:` +
        `${now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()}:` +
        `${now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds()}.`;
    let millis = String(now.getMilliseconds());
    if(millis.length === 3) {
        millis += "Z";
    } else if(millis.length === 1) {
        millis += "00Z";
    } else if(millis.length === 2) {
        millis += "0Z";
    } else {
        millis = millis.substr(0, 3) + "Z";
    }
    info.timestamp += millis;
    return info;
});
//endregion

//region Formats
const __normalMessagePrinter = winston.format.printf((info) => {
    let levelSpacer = "";
    let tagString = "";
    switch (info.level) {
        case "error":
        case "debug":
            levelSpacer = "  ";
            break;
        case "warn":
        case "info":
            levelSpacer = "   ";
            break;
    }

    if (info.tag === null) {
        tagString = "";
    } else {
        tagString = `[${info.tag}] `;
    }
    return `${info.timestamp} ${levelSpacer}<${info.level.toUpperCase()}> ${tagString}${info.message}`;
});
const __profilingPrinter = winston.format.printf((info) => {
    let levelSpacer = "";
    let tagString = "";
    switch (info.level) {
        case "error":
        case "debug":
            levelSpacer = "  ";
            break;
        case "warn":
        case "info":
            levelSpacer = "   ";
            break;
    }

    if (info.tag === null) {
        tagString = "";
    } else {
        tagString = `[${info.tag}] `;
    }
    return `${info.timestamp} ${levelSpacer}<PROFILE> ${tagString}${info.message}`;
});
const __normalMessageFormat = winston.format.combine(__generateLocalTimestamp(), __normalMessagePrinter);
const __profileMessageFormat = winston.format.combine(__generateLocalTimestamp(), __profilingPrinter);
//endregion

//region Constructed Loggers
const __ConsoleLogger = winston.createLogger({
    level: process.env.LOGGER_LEVEL,
    format: __normalMessageFormat,
    transports: [
        __consoleTransport
    ]
});

const __ProfileLogger = winston.createLogger({
    level: process.env.PROFILING_LEVEL,
    format: __profileMessageFormat,
    transports: [
        __consoleTransport
    ]
});
//endregion

//region Static Private Methods
function __log(level, message, tag, opts) {

    let info = __generateInfoObject(level, message, tag);
    if(info === null) { return; }

    if(!opts.suppressConsole) {
        __ConsoleLogger.log(info);
    }
}
function __profile(level, value, key, opts) {
    let info = __generateInfoObject(level, value, key);
    if(info === null) { return; }

    if(!opts.suppressConsole) {
        __ProfileLogger.log(info);
    }
}
function __generateInfoObject(level, message, tag) {
    let info;

    if(message instanceof Error) {
        message = message.stack;
    }
    if(tag !== null && message !== null) {
        info = {
            level: level,
            message: message,
            tag: tag
        };
    } else if(tag === null && message !== null) {
        info = {
            level: level,
            message: message,
            tag: null
        };
    } else if(tag !== null && message === null) {
        info = {
            level: level,
            message: tag,
            tag: null
        };
    } else {
        info = null;
    }

    return info;
}
//endregion

//region Exported Object
let StaticLogger = {};

StaticLogger.error = function (tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("error", msg, tag, opts);
};
StaticLogger.warn = function (tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("warn", msg, tag, opts);
};
StaticLogger.info = function (tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("info", msg, tag, opts);
};
StaticLogger.verbose = function(tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("verbose", msg, tag, opts);
};
StaticLogger.debug = function (tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("debug", msg, tag, opts);
};
StaticLogger.silly = function (tag = null, msg = null, opts = {
    suppressConsole: false,
}) {
    __log("silly", msg, tag, opts);
};
StaticLogger.profile = function(field = null, value = null, opts = {
    suppressConsole: false,
}) {
    __profile("info", value, field, opts);
};
//endregion

module.exports = StaticLogger;