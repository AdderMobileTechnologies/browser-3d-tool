const StaticLogger = require("./staticLogger");

class ImmutableTagLogger {
    constructor(tag = null) {
        const _TAG = tag === null ? "UNDEFINED" : tag;

        this.getTag = () => { return _TAG; }
    }

    error(msg = null) {
        StaticLogger.error(this.getTag(), msg);
    }

    warn(msg = null) {
        StaticLogger.warn(this.getTag(), msg);
    }

    info(msg = null) {
        StaticLogger.info(this.getTag(), msg);
    }

    verbose(msg = null) {
        StaticLogger.warn(this.getTag(), msg);
    }

    debug(msg = null) {
        StaticLogger.debug(this.getTag(), msg);
    }

    silly(msg = null) {
        StaticLogger.silly(this.getTag(), msg);
    }

    // noinspection JSMethodCanBeStatic
    profile(key = null, value = null) {
        StaticLogger.profile(key, value);
    }
}

module.exports = ImmutableTagLogger;