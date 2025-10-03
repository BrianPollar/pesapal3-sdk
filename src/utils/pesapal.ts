/**
 * @file PesaPal SDK for TypeScript
 * @description A comprehensive SDK for integrating with PesaPal payment gateway
 * @module pesapal
 */

/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as tracer from 'tracer';
import { Iconfig } from '../init';
import {
  IgetIpnEndPointsRes, IgetTokenRes,
  IgetTransactionStatusRes, IipnResponse, IorderResponse, IpayDetails,
  IpesaPalError,
  IpesaPalToken, IrefundRequestReq, IrefundRequestRes,
  IrefundRequestResComplete, IregisterIpnRes, IrelegateTokenStatusRes,
  IsubmitOrderRes, TnotificationMethodType
} from '../types/core-types';
import { PesaPalError } from './error-handler';

/**
 * Logger instance for the PesaPal SDK
 * @type {tracer.Tracer.Logger}
 */
export const logger = tracer.colorConsole({
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
export const stringifyIfObj = <T>(val: T): string =>
  (typeof val === 'string' ? val : JSON.stringify(val));

/**
 * Main class for interacting with the PesaPal API
 * @class Pesapal
 * @description Provides methods to interact with PesaPal payment gateway
 */
export class Pesapal {
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
  defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  /**
   * Array of registered IPN (Instant Payment Notification) endpoints
   * @type {IipnResponse[]}
   */
  ipns: IipnResponse[] = [];

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
  constructor(public config: Iconfig) {
    if (config.PESAPAL_ENVIRONMENT === 'live') {
      this.pesapalUrl = 'https://pay.pesapal.com/v3';
    } else {
      this.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
    }
    this.interceptAxios();
  }

  /**
   * Intercepts Axios requests to add authorization headers
   * @private
   * @returns {void}
   */
  interceptAxios(): void {
    axios.interceptors.request.use((config) => {
      if (!this.tokenExpired()) {
        config.headers.Authorization = 'Bearer ' + this.token?.token;
      } else {
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
  async registerIpn(ipn?: string, notificationMethodType: TnotificationMethodType = 'GET'): Promise<IregisterIpnRes> {
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
      axios
        .post(
          `${this.pesapalUrl}/api/URLSetup/RegisterIPN`,
          parameters,
          { headers }
        )
        .then(res => {
          const response = res.data as IipnResponse;

          if (response.error) {
            if (typeof response.error === 'string') {
              reject(new Error(response.error));
            } else {
              reject(new PesaPalError(response.error));
            }
          } else {
            this.ipns = [...this.ipns, response];
            resolve({ success: true });
          }
        }).catch((err) => {
          logger.error('PesaPalController, registerIpn err', err);
          reject(new Error(stringifyIfObj(err)));
        });
    });
  }

  /**
   * Retrieves the list of registered IPN endpoints
   * @async
   * @returns {Promise<IgetIpnEndPointsRes>} Promise that resolves with the list of IPN endpoints
   * @throws {Error} If token cannot be obtained or IPN endpoints cannot be retrieved
   */
  async getIpnEndPoints(): Promise<IgetIpnEndPointsRes> {
    const gotToken = await this.relegateTokenStatus().catch(err => err);

    if (gotToken instanceof Error) {
      return new Promise((resolve, reject) => reject(gotToken));
    }

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise((resolve, reject) => {
      axios
        .get(
          `${this.pesapalUrl}/api/URLSetup/GetIpnList`,
          { headers }
        )
        .then(res => {
          const response = res.data as IipnResponse[];

          logger.debug('PesaPalController, getIpnEndPoints response', response);
          if (response[0] && response[0].error) {
            if (typeof response[0].error === 'string') {
              reject(new Error(response[0].error));
            } else {
              reject(new PesaPalError(response[0].error));
            }
          } else {
            this.ipns = res.data as IipnResponse[];
            resolve({ success: true });
          }
        }).catch((err) => {
          logger.error('PesaPalController, getIpnEndPoints err', err);
          reject(new Error(stringifyIfObj(err)));
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
  async submitOrder(
    paymentDetails: IpayDetails,
    productId: string,
    description: string
  ): Promise<IsubmitOrderRes> {
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
    logger.info('Submitting order', {
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
      const response = await axios.post(
        `${this.pesapalUrl}/api/Transactions/SubmitOrderRequest`,
        this.constructParamsFromObj(paymentDetails, productId, description),
        { headers }
      );

      // Handle response
      const orderResponse = response.data as IorderResponse;

      // Robust error handling
      if (orderResponse.error) {
        const errorDetails =
          typeof orderResponse.error === 'string' ?
            { message: orderResponse.error } :
            orderResponse.error || { message: 'Unknown error' };

        logger.error('Order submission failed', {
          errorType: 'api_response_error',
          errorMessage: errorDetails.message
        });

        throw new Error(errorDetails.message);
      }

      logger.info('Order submitted successfully', {
        transactionType: 'order_submission_complete'
      });

      return {
        success: true,
        status: response.status,
        pesaPalOrderRes: orderResponse
      };
    } catch (err) {
      logger.error('Order submission error', {
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
  async getTransactionStatus(orderTrackingId: string): Promise<IgetTransactionStatusRes> {
    const gotToken = await this.relegateTokenStatus().catch(err => err);

    if (gotToken instanceof Error) {
      return new Promise((resolve, reject) => reject(gotToken));
    }

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise((resolve, reject) => {
      axios
        .get(
          `${this.pesapalUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
          { headers }
        ).then(res => {
          const response = res.data as IgetTransactionStatusRes;

          if (response.error) {
            reject(new Error(`${response.error.message} on ${response.error.call_back_url}`));
          } else if (response.payment_status_description.toLowerCase() === 'completed') {
            resolve(response);
          } else {
            reject(new Error(`Getting Transaction Status Failed With ${response.payment_status_description}`));
          }
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          reject(new Error(stringifyIfObj(err)));
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
  async refundRequest(refunReqObj: IrefundRequestReq): Promise<IrefundRequestResComplete> {
    const gotToken = await this.relegateTokenStatus().catch(err => err);

    if (gotToken instanceof Error) {
      return new Promise((resolve, reject) => reject(gotToken));
    }

    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token.token
    };

    return new Promise((resolve, reject) => {
      axios
        .post(
          `${this.pesapalUrl}/api/Transactions/RefundRequestt`,
          refunReqObj,
          { headers }
        )
        .then(res => {
          const response = res.data as IrefundRequestRes;

          if (!response) {
            reject(new Error('Refund Unsuccessful'));
          } else {
            resolve({ success: true, refundRequestRes: response });
          }
        }).catch((err) => {
          logger.error('PesaPalController, submitOrder err', err);
          reject(new Error(stringifyIfObj(err)));
        });
    });
  }

  /**
   * Gets the PesaPal token
   * @async
   * @returns {Promise<IgetTokenRes>} Promise that resolves with the token
   * @throws {Error} If token cannot be obtained
   */
  getToken(): Promise<IgetTokenRes> {
    const headers = {
      ...this.defaultHeaders
    };
    const parameters = {
      consumer_key: this.config.PESAPAL_CONSUMER_KEY,
      consumer_secret: this.config.PESAPAL_CONSUMER_SECRET
    };

    return new Promise((resolve, reject) => {
      axios
        .post(
          `${this.pesapalUrl}/api/Auth/RequestToken`,
          parameters,
          { headers }
        )
        .then(res => {
          const data = res.data as IpesaPalToken;

          logger.debug('response data from getToken()', data);

          if (data?.error) {
            logger.error('PesaPalController, unknown err', (data.error as IpesaPalError).message || data.error);
            if (typeof data.error === 'string') {
              reject(new Error(data.error));
            } else {
              reject(new PesaPalError(data.error));
            }
          } else if (data?.token) {
            this.token = data;
            // set token to file
            /** fs.writeFileSync(lConfig.
            encryptedDirectory + 'airtltoken', JSON.stringify(token)); */
            resolve({ success: true });
          } else {
            logger.error('PesaPalController, unknown err', 'sorry but unknwn');
            this.token = null;

            reject(new Error('Get token failed with unknown err'));
          }
          resolve({ success: true });
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          reject(new Error(stringifyIfObj(err)));
        });
    });
  }

  /**
   * Checks if the token is expired
   * @private
   * @returns {boolean} True if the token is expired, false otherwise
   */
  private tokenExpired(): boolean {
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
  private async relegateTokenStatus(): Promise<IrelegateTokenStatusRes> {
    const response: IrelegateTokenStatusRes = {
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
        } else {
          response.success = true;
          response.madeNewToken = true;
        }
      } else {
        // await this.getToken();
        response.success = true;
        response.madeNewToken = false;
      }
    } else {
      const tokenRes = await this.getToken().catch(err => err);

      if (tokenRes instanceof Error) {
        return new Promise((resolve, reject) => reject(tokenRes));
      }

      if (!tokenRes.success) {
        response.success = false;
        response.madeNewToken = false;
      } else {
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
  private constructParamsFromObj(
    paymentDetails: IpayDetails,
    id: string,
    description: string,
    countryCode = 'UG',
    countryCurrency = 'UGA'
  ) {
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

    logger.debug('constructParamsFromObj, constructedObj', constructedObj);

    return constructedObj;
  }

  /**
   * Checks if the token is present
   * @private
   * @returns {boolean} True if the token is present, false otherwise
   */
  private hasToken(): boolean {
    return Boolean(this.token?.token);
  }
}
