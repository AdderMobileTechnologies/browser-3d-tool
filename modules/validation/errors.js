/**
 * Contains classes representing errors that can occur during operations launched by any Validation module operation.
 *
 * @namespace Errors
 * @memberOf module:Validation
 */

class StandardError {
    /**
     * Creates a new, immutable instance of StandardError, representing an error that occurs during a validation procedure.
     * @param error
     * @param {Object} offender An optional object that indicates the data source that caused the error. This could
     * be used, for example, to indicate the specific property of an input object that caused the error to be
     * thrown, along with the error itself.
     */
    constructor(error = "UNKNOWN", offender = {}) {
        const _error = error;
        const _offender = offender;

        this.getError = () => { return _error };
        this.getOffender = () => { return _offender };
        this.toString = () => {
            return JSON.stringify({err: _error, offender: _offender}, null, 4);
        }
    }
}


module.exports = {
    StandardError,

};
