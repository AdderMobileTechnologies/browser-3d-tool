'use strict';

/**
 * Contains classes representing errors that can occur during operations launched by any Validation module operation.
 *
 * @namespace Mongo
 * @memberOf module:Validation
 */

class ObjectIdValidator {
    constructor() { }

    static validate(id) {
        return (typeof id === "string" && /[A-Z0-9]{24}/i.test(id));
    }
}

module.exports = {
    ObjectIdValidator
};
