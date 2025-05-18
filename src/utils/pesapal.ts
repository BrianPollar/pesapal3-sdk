/* eslint-disable @typescript-eslint/naming-convention */
import { faker } from '@faker-js/faker';
import axios from 'axios';
import * as fs from 'fs';
import * as tracer from 'tracer';
import { Iconfig } from '../init';
import {
  IendpointResponse, IgetIpnEndPointsRes, IgetTokenRes,
  IgetTransactionStatusRes, IipnResponse, IorderResponse, IpayDetails,
  IpesaPalError, IpesaPalToken, IrefundRequestReq, IrefundRequestRes,
  IrefundRequestResComplete, IregisterIpnRes, IrelegateTokenStatusRes,
  IsubmitOrderRes, TnotificationMethodType
} from '../types/core-types';
import { PesaPalError } from './error-handler';

export const logger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = './serverLog/';

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          throw err;
        }
      }
    });
    fs.appendFile('./serverLog/pesapal.log', data.rawoutput + '\n', err => {
      if (err) {
        throw err;
      }
    });
  }
});

/**
 * This function creates a mock pay details object.
 * The `ipnUrl` property is the IPN URL.
 * The `phone` property is the phone number of the payer.
 *
 * The function returns an object with the following properties:
 * * `id`: The ID of the pay details.
 * * `currency`: The currency of the pay details.
 * * `amount`: The amount of the pay details.
 * * `description`: The description of the pay details.
 * * `callback_url`: The callback URL of the pay details.
 * * `notification_id`: The notification ID of the pay details.
 * * `billing_address`: The billing address of the payer.
 */
export const createMockPayDetails = (ipnUrl: string, phone: string) => ({
  id: faker.string.uuid(),
  currency: 'UGX',
  amount: 1000,
  description: faker.string.alphanumeric(),
  callback_url: 'http://localhost:4000',
  notification_id: ipnUrl,
  billing_address: {
    email_address: faker.internet.email(),
    phone_number: phone,
    country_code: 'UGA',
    first_name: faker.internet.userName(),
    middle_name: faker.internet.userName(),
    last_name: faker.internet.userName(),
    line_1: faker.string.alphanumeric(),
    line_2: faker.string.alphanumeric(),
    city: 'Kampala',
    state: 'Uganda',
    postal_code: '0000',
    zip_code: '0000'
  }
});

export const stringifyIfObj = <T>(val: T): string =>
  (typeof val === 'string' ? val : JSON.stringify(val));

/**
 * This class is a controller for PesaPal payments.
 * The `token` property is the PesaPal token.
 * The `ipns` property is an array of IIPnResponse objects.
 * The `defaultHeaders` property is an object with the default headers for the requests.
 * The `callbackUrl` property is the main callback URL.
 * The `notificationId` property is the notification ID.
 */
export class Pesapal {
  // callbackUrl: string; // main callback url
  notificationId: string;
  defaultHeaders = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Accept: 'application/json',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json'
  };

  ipns: IipnResponse[] = [];
  pesapalUrl: string;
  token: IpesaPalToken;

  constructor(public config: Iconfig) {
    if (config.PESAPAL_ENVIRONMENT === 'live') {
      this.pesapalUrl = 'https://pay.pesapal.com/v3';
    } else {
      this.pesapalUrl = 'https://cybqa.pesapal.com/pesapalv3';
    }
    this.interceptAxios();
  }

  /**
   * Intercepts Axios requests and adds the PesaPal token to the Authorization header if it is available.
   * This ensures that the PesaPal token is included in all outgoing requests.
   */
  interceptAxios() {
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
 * This method registers the IPN URL with PesaPal.
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 */
  async registerIpn(ipn?: string, notificationMethodType?: TnotificationMethodType): Promise<IregisterIpnRes> {
    const gotToken = await this.relegateTokenStatus().catch(err => err);

    if (gotToken instanceof Error) {
      return new Promise((resolve, reject) => reject(gotToken));
    }

    if (!gotToken.success) {
      return new Promise((resolve, reject) => reject(new Error('couldnt resolve getting token')));
    }

    const ipnUrl = ipn || this.config.PESAPAL_IPN_URL;
    const ipnNotificationType = notificationMethodType || 'GET';

    const parameters = {
      url: ipnUrl,
      ipn_notification_type: ipnNotificationType
    };


    const headers = {
      ...this.defaultHeaders,
      Authorization: 'Bearer  ' + this.token?.token
    };

    return new Promise((resolve, reject) => {
      axios
        .post(
          this.pesapalUrl +
        '/api/URLSetup/RegisterIPN',
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
            this.ipns = [ ...this.ipns, response];
            resolve({ success: true });
          }
        }).catch((err) => {
          logger.error('PesaPalController, registerIpn err', err);
          reject(new Error(stringifyIfObj(err)));
        });
    });
  }

  /**
 * This method gets the IPN endpoints from PesaPal.
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
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
          this.pesapalUrl +
        '/api/URLSetup/GetIpnList',
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
 * This method submits the order to PesaPal.
 * The method takes the following parameters:
 * * `paymentDetails`: The payment details object.
 * * `productId`: The ID of the product.
 * * `description`: The description of the payment.
 *
 * The method returns a promise with the following properties:
 * * `success`: Indicates whether the request was successful.
 * * `status`: The status of the order.
 * * `pesaPalOrderRes`: The PesaPal order response.
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
      const notifId = this.ipns[0].ipn_id;

      // Prepare headers with trimmed Bearer token
      const headers = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${this.token.token.trim()}`
      };

      // Make API call
      const response = await axios.post(
        `${this.pesapalUrl}/api/Transactions/SubmitOrderRequest`,
        this.constructParamsFromObj(paymentDetails, notifId, productId, description),
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
 * This method gets the transaction status from PesaPal.
 * The method takes the following parameters:
 * * `orderTrackingId`: The order tracking ID.
 *
 * The method returns a promise with the following properties:
 * * `success`: Indicates whether the request was successful.
 * * `response`: The response from PesaPal.
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
          this.pesapalUrl +
        '/api/Transactions/GetTransactionStatus' +
        `?orderTrackingId=${orderTrackingId}`,
          { headers }
        ).then(res => {
          const response = res.data as IendpointResponse;

          if (response.error) {
            reject(new Error(response.error.message + ' on ' + response.error.call_back_url));
          } else if (response.payment_status_description.toLowerCase() === 'completed') {
            resolve({ success: true, response });
          } else {
            reject(new Error('Getting Transaction Status Failed With ' + response.payment_status_description));
            resolve({ success: false, status: response.payment_status_description });
          }
        }).catch((err) => {
          logger.error('PesaPalController, getToken err', err);
          reject(new Error(stringifyIfObj(err)));
        });
    });
  }


  /**
   * Sends a refund request for a transaction.
   * @param refunReqObj - The refund request object.
   * @returns A promise that resolves to the refund request response.
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
          this.pesapalUrl +
        '/api/Transactions/RefundRequestt',
          refunReqObj,
          { headers }
        )
        .then(res => {
          const response = res.data as IrefundRequestRes;

          if (!response) {
            reject(new Error('Refund Unsuccesful'));
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
 * This method gets the PesaPal token.
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `err`: The error, if any.
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
          this.pesapalUrl +
        '/api/Auth/RequestToken',
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

  private tokenExpired() {
    if (!this.hasToken()) {
      return true;
    }
    const nowDate = new Date();
    const tokenDate = new Date(this.token.expiryDate);

    return nowDate > tokenDate;
  }

  /**
 * This method checks the status of the token and creates a new token if it is expired.
 *
 * The method returns a promise with the following properties:
 *
 * * `success`: Indicates whether the request was successful.
 * * `madeNewToken`: Indicates whether a new token was created.
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
 * This method constructs the parameters from the object.
 * The method takes the following parameters:
 * * `paymentDetails`: The payment details object.
 * * `notificationId`: The notification ID.
 * * `id`: The ID of the payment.
 * * `description`: The description of the payment.
 *
 * The method returns an object with the following properties:
 * * `id`: The ID of the payment.
 * * `currency`: The currency of the payment.
 * * `amount`: The amount of the payment.
 * * `description`: The description of the payment.
 * * `callback_url`: The callback URL of the payment.
 * * `notification_id`: The notification ID of the payment.
 * * `billing_address`: The billing address of the payer.
 * * `countryCode`: The country code to map country the payment is from.
 * * `countryCurrency`: The countriesmoney currency.
 */
  private constructParamsFromObj(
    paymentDetails: IpayDetails,
    notificationId: string,
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
      notification_id: notificationId,
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
 * This method checks if the token is present.
 * The method returns `true` if the token is present, and `false` otherwise.
 */
  private hasToken() {
    return Boolean(this.token?.token);
  }
}
