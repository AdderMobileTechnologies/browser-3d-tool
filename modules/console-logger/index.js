require("dotenv").config();

class ConsoleLogger {
    constructor(tag = "UNKNOWN") {

        this.infoVerbosity = Number(process.env.LOGGER_INFO_VERBOSITY);
        this.errorVerbosity = Number(process.env.LOGGER_ERROR_VERBOSITY);
        this.debugVerbosity = Number(process.env.LOGGER_DEBUG_VERBOSITY);
        this.profileVerbosity = Number(process.env.LOGGER_PROFILE_VERBOSITY);

        this.TAG = "[" + tag + "] ";

        this.info = this.info.bind(this);
        this.error = this.error.bind(this);
        this.debug = this.debug.bind(this);
        this.profile = this.profile.bind(this);
    }

    info(message = null, overrideTag = null) {
        if(typeof message !== "string") {
            console.error("WARNING > ConsoleLogger.info(message): Method called with non-string message \"" + message + "\".");
            return;
        }
        if(this.infoVerbosity === 0) {
            return;
        }
        let out = new Date().toISOString().split(".")[0] + " <INFO> ";
        if(overrideTag) {
            out += "[" + overrideTag + "] " + message;
        } else {
            out += this.TAG + message;
        }
        console.log(out);
    }

    error(message = null, overrideTag = null) {
        if(typeof message !== "string") {
            console.error("WARNING > ConsoleLogger.error(message): Method called with non-string message \"" + message + "\".");
            return;
        }
        if(this.errorVerbosity === 0) {
            return;
        }
        let out = new Date().toISOString().split(".")[0] + " <ERROR> ";
        if(overrideTag) {
            out += "[" + overrideTag + "] " + message;
        } else {
            out += this.TAG + message;
        }
        console.error(out);
    }

    debug(message = null, overrideTag = null) {
        if(typeof message !== "string") {
            console.error("WARNING > ConsoleLogger.debug(message): Method called with non-string message \"" + message + "\".");
            return;
        }
        if(this.debugVerbosity === 0) {
            return;
        }
        let out = new Date().toISOString().split(".")[0] + " <DEBUG> ";
        if(overrideTag) {
            out += "[" + overrideTag + "] " + message;
        } else {
            out += this.TAG + message;
        }
        console.log(out);
    }
    profile(message = null, overrideTag = null) {
        if(typeof message !== "string") {
            console.error("WARNING > ConsoleLogger.debug(message): Method called with non-string message \"" + message + "\".");
            return;
        }
        if(this.profileVerbosity === 0) {
            return;
        }
        let out = new Date().toISOString().split(".")[0] + " <PROFILE> ";
        if(overrideTag) {
            out += "[" + overrideTag + "] " + message;
        } else {
            out += this.TAG + message;
        }
        console.log(out);
    }
}

module.exports = ConsoleLogger;