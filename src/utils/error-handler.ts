import { IpesaPalError } from '../types/core-types';

/**
 * Custom error class for PesaPal API errors
 * @class PesaPalError
 * @extends Error
 * @property {string} name - The name of the error ('PesaPalError')
 * @property {string} code - Error code from the PesaPal API
 * @property {string} type - Type/category of the error
 * @property {string} message - Human-readable error message
 */
export class PesaPalError extends Error {
  code: string;
  type: string;

  /**
   * Creates a new PesaPalError instance
   * @param {IpesaPalError} err - The error object from PesaPal API
   */
  constructor(err: IpesaPalError) {
    super(err.message);
    this.name = 'PesaPalError';
    this.code = err.code;
    this.type = err.type;
  }
}

/**
 * Error class for invalid configuration in the PesaPal SDK
 * @class PesaPalInvalidConfigError
 * @extends Error
 * @property {string} name - The name of the error ('PesaPalInvalidConfigError')
 * @property {string} message - Description of the configuration error
 */
export class PesaPalInvalidConfigError extends Error {
  /**
   * Creates a new PesaPalInvalidConfigError instance
   * @param {string} message - Description of the configuration error
   */
  constructor(message: string) {
    super(message);
    this.name = 'PesaPalInvalidConfigError';
  }
}
