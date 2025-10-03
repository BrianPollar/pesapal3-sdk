/**
 * @file PesaPal SDK for TypeScript
 * @description A comprehensive SDK for integrating with PesaPal payment gateway
 * @module pesapal
 */
import * as tracer from 'tracer';
import { Iconfig } from '../init';
import { IgetIpnEndPointsRes, IgetTokenRes, IgetTransactionStatusRes, IipnResponse, IpayDetails, IpesaPalToken, IrefundRequestReq, IrefundRequestResComplete, IregisterIpnRes, IsubmitOrderRes, TnotificationMethodType } from '../types/core-types';
/**
 * Logger instance for the PesaPal SDK
 * @type {tracer.Tracer.Logger}
 */
export declare const logger: tracer.Tracer.Logger<string>;
/**
 * Converts a value to string, handling objects by JSON stringification
 * @template T - The type of the input value
 * @param {T} val - The value to stringify
 * @returns {string} The stringified value
 */
export declare const stringifyIfObj: <T>(val: T) => string;
/**
 * Main class for interacting with the PesaPal API
 * @class Pesapal
 * @description Provides methods to interact with PesaPal payment gateway
 */
export declare class Pesapal {
    config: Iconfig;
    /**
     * The notification ID for IPN (Instant Payment Notification)
     * @type {string}
     */
    notificationId: string;
    /**
     * Default headers for HTTP requests
     * @type {Object}
     * @property {string} Accept - Accept header
     * @property {string} Content-Type - Content type header
     */
    defaultHeaders: {
        Accept: string;
        'Content-Type': string;
    };
    /**
     * Array of registered IPN (Instant Payment Notification) endpoints
     * @type {IipnResponse[]}
     */
    ipns: IipnResponse[];
    /**
     * Base URL for PesaPal API
     * @type {string}
     */
    pesapalUrl: string;
    /**
     * Authentication token for PesaPal API
     * @type {IpesaPalToken}
     */
    token: IpesaPalToken;
    /**
     * Creates a new instance of the Pesapal class
     * @constructor
     * @param {Iconfig} config - Configuration object containing PesaPal credentials
     * @param {string} config.PESAPAL_ENVIRONMENT - Environment type ('live' or 'sandbox')
     */
    constructor(config: Iconfig);
    /**
     * Intercepts Axios requests to add authorization headers
     * @private
     * @returns {void}
     */
    interceptAxios(): void;
    /**
     * Registers an IPN (Instant Payment Notification) URL with PesaPal
     * @async
     * @param {string} [ipn] - The IPN URL to register
     * @param {TnotificationMethodType} [notificationMethodType='GET'] - The notification method type
     * @returns {Promise<IregisterIpnRes>} Promise that resolves when IPN is registered
     * @throws {Error} If token cannot be obtained or IPN registration fails
     */
    registerIpn(ipn?: string, notificationMethodType?: TnotificationMethodType): Promise<IregisterIpnRes>;
    /**
     * Retrieves the list of registered IPN endpoints
     * @async
     * @returns {Promise<IgetIpnEndPointsRes>} Promise that resolves with the list of IPN endpoints
     * @throws {Error} If token cannot be obtained or IPN endpoints cannot be retrieved
     */
    getIpnEndPoints(): Promise<IgetIpnEndPointsRes>;
    /**
     * Submits an order to PesaPal
     * @async
     * @param {IpayDetails} paymentDetails - The payment details
     * @param {string} productId - The product ID
     * @param {string} description - The order description
     * @returns {Promise<IsubmitOrderRes>} Promise that resolves with the order submission result
     * @throws {Error} If input validation fails or order submission fails
     */
    submitOrder(paymentDetails: IpayDetails, productId: string, description: string): Promise<IsubmitOrderRes>;
    /**
     * Gets the status of a transaction
     * @async
     * @param {string} orderTrackingId - The order tracking ID
     * @returns {Promise<IgetTransactionStatusRes>} Promise that resolves with the transaction status
     * @throws {Error} If token cannot be obtained or transaction status cannot be retrieved
     */
    getTransactionStatus(orderTrackingId: string): Promise<IgetTransactionStatusRes>;
    /**
     * Submits a refund request for a transaction
     * @async
     * @param {IrefundRequestReq} refunReqObj - The refund request object
     * @returns {Promise<IrefundRequestResComplete>} Promise that resolves with the refund request result
     * @throws {Error} If token cannot be obtained or refund request fails
     */
    refundRequest(refunReqObj: IrefundRequestReq): Promise<IrefundRequestResComplete>;
    /**
     * Gets the PesaPal token
     * @async
     * @returns {Promise<IgetTokenRes>} Promise that resolves with the token
     * @throws {Error} If token cannot be obtained
     */
    getToken(): Promise<IgetTokenRes>;
    /**
     * Checks if the token is expired
     * @private
     * @returns {boolean} True if the token is expired, false otherwise
     */
    private tokenExpired;
    /**
     * Checks the status of the token and creates a new token if it is expired
     * @async
     * @private
     * @returns {Promise<IrelegateTokenStatusRes>} Promise that resolves with the token status
     * @throws {Error} If token cannot be obtained or created
     */
    private relegateTokenStatus;
    /**
     * Constructs the parameters from the object
     * @private
     * @param {IpayDetails} paymentDetails - The payment details
     * @param {string} id - The ID of the payment
     * @param {string} description - The description of the payment
     * @param {string} [countryCode='UG'] - The country code
     * @param {string} [countryCurrency='UGA'] - The country currency
     * @returns {Object} The constructed parameters
     */
    private constructParamsFromObj;
    /**
     * Checks if the token is present
     * @private
     * @returns {boolean} True if the token is present, false otherwise
     */
    private hasToken;
}
