'use strict';

/**
 * Contains classes representing errors that can occur during operations launched by any Validation module operation.
 *
 * @namespace Time
 * @memberOf module:Validation
 */

class BasicTimestampValidator {
    /**
     * A basic timestamp validator. Currently a stub class.
     *
     * @todo Needs proper implementation.
     * @class
     */
    constructor() { }

    /**
     * Currently a stubbed method. Simply returns true every call.
     *
     * @param timestamp The timestamp to verify.
     * @returns {boolean} A boolean indicating if timestamp is valid.
     */
    static validate(timestamp) {
        return(typeof timestamp === "number" && /-?[0-9]{0,10}/.test(String(timestamp)));
    }
}

class BasicTimeRangeValidator {
    /**
     * A basic time range validator. Currently a stub class.
     *
     * @class
     */
    constructor() {}

    /**
     * Currently a stubbed method. Simply returns true every call.
     *
     * @param sts A timestamp indicating the beginning of the time range
     * @param ets A timestamp indicating the end of the time range.
     * @returns {boolean} A boolean indicating if the time range is valid.
     */
    static validate(sts, ets) {
        return (BasicTimestampValidator.validate(sts) && BasicTimestampValidator.validate(ets) && ets >= sts);
    }
}

module.exports = {
    BasicTimestampValidator,
    BasicTimeRangeValidator
};
