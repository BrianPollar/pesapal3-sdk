"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesaPalInvalidConfigError = exports.PesaPalError = void 0;
/**
 * Custom error class for PesaPal API errors
 * @class PesaPalError
 * @extends Error
 * @property {string} name - The name of the error ('PesaPalError')
 * @property {string} code - Error code from the PesaPal API
 * @property {string} type - Type/category of the error
 * @property {string} message - Human-readable error message
 */
class PesaPalError extends Error {
    /**
     * Creates a new PesaPalError instance
     * @param {IpesaPalError} err - The error object from PesaPal API
     */
    constructor(err) {
        super(err.message);
        this.name = 'PesaPalError';
        this.code = err.code;
        this.type = err.type;
    }
}
exports.PesaPalError = PesaPalError;
/**
 * Error class for invalid configuration in the PesaPal SDK
 * @class PesaPalInvalidConfigError
 * @extends Error
 * @property {string} name - The name of the error ('PesaPalInvalidConfigError')
 * @property {string} message - Description of the configuration error
 */
class PesaPalInvalidConfigError extends Error {
    /**
     * Creates a new PesaPalInvalidConfigError instance
     * @param {string} message - Description of the configuration error
     */
    constructor(message) {
        super(message);
        this.name = 'PesaPalInvalidConfigError';
    }
}
exports.PesaPalInvalidConfigError = PesaPalInvalidConfigError;
//# sourceMappingURL=error-handler.js.map