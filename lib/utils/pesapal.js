"use strict";
/**
 * @file PesaPal SDK for TypeScript
 * @description A comprehensive SDK for integrating with PesaPal payment gateway
 * @module pesapal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pesapal = exports.stringifyIfObj = exports.logger = void 0;
const tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/naming-convention */
const axios_1 = tslib_1.__importDefault(require("axios"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const error_handler_1 = require("./error-handler");
/**
 * Logger instance for the PesaPal SDK
 * @type {tracer.Tracer.Logger}
 */
exports.logger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path.join(process.cwd() + '/logs/');
        fs.mkdir(logDir, { recursive: true }, (err) => {
            if (err) {
                if (err) {
                    throw err;
                }
            }
        });
        fs.appendFile(logDir + '/pesapal.log', data.rawoutput + '\n', err => {
            if (err) {
                throw err;
            }
        });
    }
});
/**
 * Converts a value to string, handling objects by JSON stringification
 * @template T - The type of the input value
 * @param {T} val - The value to stringify
 * @returns {string} The stringified value
 */
const stringifyIfObj = (val) => (typeof val === 'string' ? val : JSON.stringify(val));
exports.stringifyIfObj = stringifyIfObj;
/**
 * Main class for interacting with the PesaPal API
 * @class Pesapal
 * @description Provides methods to interact with PesaPal payment gateway
 */
class Pesapal {
    /**
     * Creates a new instance of the Pesapal class
     * @constructor
     * @param {Iconfig} config - Configuration object containing PesaPal credentials
     * @param {string} config.PESAPAL_ENVIRONMENT - Environment type ('live' or 'sandbox')
     */
    constructor(config) {
        this.config = config;
        /**
         * Default headers for HTTP requests
         * @type {Object}
         * @property {string} Accept - Accept header
         * @property {string} Content-Type - Content type header
         */
        this.defaultHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        /**
         * Array of registered IPN (Instant Payment Notification) endpoints
         * @type {IipnResponse[]}
         */
        this.ipns = [];
        if (config.PESAPAL_ENVIRONMENT === 'live') {
            this.pesapalUrl = 'https://pay.pesapal.com/v3';
        }
        else {
            this.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
        }
        this.interceptAxios();
    }
    /**
     * Intercepts Axios requests to add authorization headers
     * @private
     * @returns {void}
     */
    interceptAxios() {
        axios_1.default.interceptors.request.use((config) => {
            if (!this.tokenExpired()) {
                config.headers.Authorization = 'Bearer ' + this.token?.token;
            }
            else {
                config.headers.Authorization = '';
            }
            return config;
        });
    }
    /**
     * Registers an IPN (Instant Payment Notification) URL with PesaPal
     * @async
     * @param {string} [ipn] - The IPN URL to register
     * @param {TnotificationMethodType} [notificationMethodType='GET'] - The notification method type
     * @returns {Promise<IregisterIpnRes>} Promise that resolves when IPN is registered
     * @throws {Error} If token cannot be obtained or IPN registration fails
     */
    async registerIpn(ipn, notificationMethodType = 'GET') {
        const gotToken = await this.relegateTokenStatus().catch(err => err);
        if (gotToken instanceof Error) {
            return new Promise((resolve, reject) => reject(gotToken));
        }
        if (!gotToken.success) {
            return new Promise((resolve, reject) => reject(new Error('couldnt resolve getting token')));
        }
        const parameters = {
            url: ipn,
            ipn_notification_type: notificationMethodType
        };
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token?.token
        };
        return new Promise((resolve, reject) => {
            axios_1.default
                .post(`${this.pesapalUrl}/api/URLSetup/RegisterIPN`, parameters, { headers })
                .then(res => {
                const response = res.data;
                if (response.error) {
                    if (typeof response.error === 'string') {
                        reject(new Error(response.error));
                    }
                    else {
                        reject(new error_handler_1.PesaPalError(response.error));
                    }
                }
                else {
                    this.ipns = [...this.ipns, response];
                    resolve({ success: true });
                }
            }).catch((err) => {
                exports.logger.error('PesaPalController, registerIpn err', err);
                reject(new Error((0, exports.stringifyIfObj)(err)));
            });
        });
    }
    /**
     * Retrieves the list of registered IPN endpoints
     * @async
     * @returns {Promise<IgetIpnEndPointsRes>} Promise that resolves with the list of IPN endpoints
     * @throws {Error} If token cannot be obtained or IPN endpoints cannot be retrieved
     */
    async getIpnEndPoints() {
        const gotToken = await this.relegateTokenStatus().catch(err => err);
        if (gotToken instanceof Error) {
            return new Promise((resolve, reject) => reject(gotToken));
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise((resolve, reject) => {
            axios_1.default
                .get(`${this.pesapalUrl}/api/URLSetup/GetIpnList`, { headers })
                .then(res => {
                const response = res.data;
                exports.logger.debug('PesaPalController, getIpnEndPoints response', response);
                if (response[0] && response[0].error) {
                    if (typeof response[0].error === 'string') {
                        reject(new Error(response[0].error));
                    }
                    else {
                        reject(new error_handler_1.PesaPalError(response[0].error));
                    }
                }
                else {
                    this.ipns = res.data;
                    resolve({ success: true });
                }
            }).catch((err) => {
                exports.logger.error('PesaPalController, getIpnEndPoints err', err);
                reject(new Error((0, exports.stringifyIfObj)(err)));
            });
        });
    }
    /**
     * Submits an order to PesaPal
     * @async
     * @param {IpayDetails} paymentDetails - The payment details
     * @param {string} productId - The product ID
     * @param {string} description - The order description
     * @returns {Promise<IsubmitOrderRes>} Promise that resolves with the order submission result
     * @throws {Error} If input validation fails or order submission fails
     */
    async submitOrder(paymentDetails, productId, description) {
        // Input validation
        if (!paymentDetails) {
            throw new Error('Payment details are required');
        }
        if (!productId) {
            throw new Error('Product ID is required');
        }
        if (!description) {
            throw new Error('Description is required');
        }
        // check if subscription details are provided if account number is provided
        if (paymentDetails.account_number && !paymentDetails.subscription_details) {
            throw new Error('Subscription details are required');
        }
        // check each val in subscription details if provided
        if (paymentDetails.subscription_details) {
            if (!paymentDetails.subscription_details.start_date ||
                !paymentDetails.subscription_details.end_date ||
                !paymentDetails.subscription_details.frequency) {
                throw new Error('Subscription details are required');
            }
        }
        // Sanitized logging
        exports.logger.info('Submitting order', {
            transactionType: 'order_submission'
        });
        try {
            // Ensure token is valid
            await this.relegateTokenStatus();
            // Safely get notification ID
            if (!this.ipns || this.ipns.length === 0) {
                throw new Error('No IPN endpoints available');
            }
            if (!paymentDetails.notification_id) {
                // if no notification_ipn_url is provided, error
                if (!paymentDetails.notification_ipn_url) {
                    throw new Error('Notification IPN URL is required');
                }
                // check notification_id against current ipn_id if no exist error
                const ipnUrls = this.ipns.map(ipn => ipn.url);
                if (!ipnUrls.includes(paymentDetails.notification_ipn_url)) {
                    throw new Error('Notification IPN URL does not match');
                }
                paymentDetails.notification_id = this.ipns.find(ipn => ipn.url === paymentDetails.notification_ipn_url)?.ipn_id;
            }
            // Prepare headers with trimmed Bearer token
            const headers = {
                ...this.defaultHeaders,
                Authorization: `Bearer ${this.token.token.trim()}`
            };
            // Make API call
            const response = await axios_1.default.post(`${this.pesapalUrl}/api/Transactions/SubmitOrderRequest`, this.constructParamsFromObj(paymentDetails, productId, description), { headers });
            // Handle response
            const orderResponse = response.data;
            // Robust error handling
            if (orderResponse.error) {
                const errorDetails = typeof orderResponse.error === 'string' ?
                    { message: orderResponse.error } :
                    orderResponse.error || { message: 'Unknown error' };
                exports.logger.error('Order submission failed', {
                    errorType: 'api_response_error',
                    errorMessage: errorDetails.message
                });
                throw new Error(errorDetails.message);
            }
            exports.logger.info('Order submitted successfully', {
                transactionType: 'order_submission_complete'
            });
            return {
                success: true,
                status: response.status,
                pesaPalOrderRes: orderResponse
            };
        }
        catch (err) {
            exports.logger.error('Order submission error', {
                errorType: 'submission_error',
                errorMessage: err instanceof Error ? err.message : 'Unknown error'
            });
            // Rethrow the original error or create a new one
            throw err instanceof Error ?
                err :
                new Error('Unexpected error during order submission');
        }
    }
    /**
     * Gets the status of a transaction
     * @async
     * @param {string} orderTrackingId - The order tracking ID
     * @returns {Promise<IgetTransactionStatusRes>} Promise that resolves with the transaction status
     * @throws {Error} If token cannot be obtained or transaction status cannot be retrieved
     */
    async getTransactionStatus(orderTrackingId) {
        const gotToken = await this.relegateTokenStatus().catch(err => err);
        if (gotToken instanceof Error) {
            return new Promise((resolve, reject) => reject(gotToken));
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise((resolve, reject) => {
            axios_1.default
                .get(`${this.pesapalUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, { headers }).then(res => {
                const response = res.data;
                if (response.error) {
                    reject(new Error(`${response.error.message} on ${response.error.call_back_url}`));
                }
                else if (response.payment_status_description.toLowerCase() === 'completed') {
                    resolve(response);
                }
                else {
                    reject(new Error(`Getting Transaction Status Failed With ${response.payment_status_description}`));
                }
            }).catch((err) => {
                exports.logger.error('PesaPalController, getToken err', err);
                reject(new Error((0, exports.stringifyIfObj)(err)));
            });
        });
    }
    /**
     * Submits a refund request for a transaction
     * @async
     * @param {IrefundRequestReq} refunReqObj - The refund request object
     * @returns {Promise<IrefundRequestResComplete>} Promise that resolves with the refund request result
     * @throws {Error} If token cannot be obtained or refund request fails
     */
    async refundRequest(refunReqObj) {
        const gotToken = await this.relegateTokenStatus().catch(err => err);
        if (gotToken instanceof Error) {
            return new Promise((resolve, reject) => reject(gotToken));
        }
        const headers = {
            ...this.defaultHeaders,
            Authorization: 'Bearer  ' + this.token.token
        };
        return new Promise((resolve, reject) => {
            axios_1.default
                .post(`${this.pesapalUrl}/api/Transactions/RefundRequestt`, refunReqObj, { headers })
                .then(res => {
                const response = res.data;
                if (!response) {
                    reject(new Error('Refund Unsuccessful'));
                }
                else {
                    resolve({ success: true, refundRequestRes: response });
                }
            }).catch((err) => {
                exports.logger.error('PesaPalController, submitOrder err', err);
                reject(new Error((0, exports.stringifyIfObj)(err)));
            });
        });
    }
    /**
     * Gets the PesaPal token
     * @async
     * @returns {Promise<IgetTokenRes>} Promise that resolves with the token
     * @throws {Error} If token cannot be obtained
     */
    getToken() {
        const headers = {
            ...this.defaultHeaders
        };
        const parameters = {
            consumer_key: this.config.PESAPAL_CONSUMER_KEY,
            consumer_secret: this.config.PESAPAL_CONSUMER_SECRET
        };
        return new Promise((resolve, reject) => {
            axios_1.default
                .post(`${this.pesapalUrl}/api/Auth/RequestToken`, parameters, { headers })
                .then(res => {
                const data = res.data;
                exports.logger.debug('response data from getToken()', data);
                if (data?.error) {
                    exports.logger.error('PesaPalController, unknown err', data.error.message || data.error);
                    if (typeof data.error === 'string') {
                        reject(new Error(data.error));
                    }
                    else {
                        reject(new error_handler_1.PesaPalError(data.error));
                    }
                }
                else if (data?.token) {
                    this.token = data;
                    // set token to file
                    /** fs.writeFileSync(lConfig.
                    encryptedDirectory + 'airtltoken', JSON.stringify(token)); */
                    resolve({ success: true });
                }
                else {
                    exports.logger.error('PesaPalController, unknown err', 'sorry but unknwn');
                    this.token = null;
                    reject(new Error('Get token failed with unknown err'));
                }
                resolve({ success: true });
            }).catch((err) => {
                exports.logger.error('PesaPalController, getToken err', err);
                reject(new Error((0, exports.stringifyIfObj)(err)));
            });
        });
    }
    /**
     * Checks if the token is expired
     * @private
     * @returns {boolean} True if the token is expired, false otherwise
     */
    tokenExpired() {
        if (!this.hasToken()) {
            return true;
        }
        const nowDate = new Date();
        const tokenDate = new Date(this.token.expiryDate);
        return nowDate > tokenDate;
    }
    /**
     * Checks the status of the token and creates a new token if it is expired
     * @async
     * @private
     * @returns {Promise<IrelegateTokenStatusRes>} Promise that resolves with the token status
     * @throws {Error} If token cannot be obtained or created
     */
    async relegateTokenStatus() {
        const response = {
            success: false,
            madeNewToken: false
        };
        if (this.hasToken()) {
            if (this.tokenExpired()) {
                const tokenRes = await this.getToken().catch(err => err);
                if (tokenRes instanceof Error) {
                    return new Promise((resolve, reject) => reject(tokenRes));
                }
                if (!tokenRes.success) {
                    response.success = false;
                    response.madeNewToken = false;
                    return response;
                }
                else {
                    response.success = true;
                    response.madeNewToken = true;
                }
            }
            else {
                // await this.getToken();
                response.success = true;
                response.madeNewToken = false;
            }
        }
        else {
            const tokenRes = await this.getToken().catch(err => err);
            if (tokenRes instanceof Error) {
                return new Promise((resolve, reject) => reject(tokenRes));
            }
            if (!tokenRes.success) {
                response.success = false;
                response.madeNewToken = false;
            }
            else {
                response.success = true;
                response.madeNewToken = false;
            }
        }
        return response;
    }
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
    constructParamsFromObj(paymentDetails, id, description, countryCode = 'UG', countryCurrency = 'UGA') {
        const constructedObj = {
            id: id || paymentDetails.id,
            currency: paymentDetails.currency || countryCurrency,
            amount: paymentDetails.amount,
            description,
            callback_url: paymentDetails.callback_url,
            notification_id: paymentDetails.notification_id,
            billing_address: {
                email_address: paymentDetails.billing_address?.email_address,
                phone_number: paymentDetails.billing_address?.phone_number,
                country_code: countryCode,
                first_name: paymentDetails.billing_address?.first_name,
                middle_name: paymentDetails.billing_address?.middle_name,
                last_name: paymentDetails.billing_address?.last_name,
                line_1: paymentDetails.billing_address?.line_1,
                line_2: paymentDetails.billing_address?.line_2,
                city: paymentDetails.billing_address?.city,
                state: paymentDetails.billing_address?.state,
                // postal_code: paymentRelated.shippingAddress?.zipcode,
                zip_code: paymentDetails.billing_address?.zip_code
            }
        };
        exports.logger.debug('constructParamsFromObj, constructedObj', constructedObj);
        return constructedObj;
    }
    /**
     * Checks if the token is present
     * @private
     * @returns {boolean} True if the token is present, false otherwise
     */
    hasToken() {
        return Boolean(this.token?.token);
    }
}
exports.Pesapal = Pesapal;
//# sourceMappingURL=pesapal.js.map