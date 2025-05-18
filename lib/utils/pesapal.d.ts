import * as tracer from 'tracer';
import { Iconfig } from '../init';
import { IgetIpnEndPointsRes, IgetTokenRes, IgetTransactionStatusRes, IipnResponse, IpayDetails, IpesaPalToken, IrefundRequestReq, IrefundRequestResComplete, IregisterIpnRes, IsubmitOrderRes, TnotificationMethodType } from '../types/core-types';
export declare const logger: tracer.Tracer.Logger<string>;
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
export declare const createMockPayDetails: (ipnUrl: string, phone: string) => {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id: string;
    billing_address: {
        email_address: string;
        phone_number: string;
        country_code: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        line_1: string;
        line_2: string;
        city: string;
        state: string;
        postal_code: string;
        zip_code: string;
    };
};
export declare const stringifyIfObj: <T>(val: T) => string;
/**
 * This class is a controller for PesaPal payments.
 * The `token` property is the PesaPal token.
 * The `ipns` property is an array of IIPnResponse objects.
 * The `defaultHeaders` property is an object with the default headers for the requests.
 * The `callbackUrl` property is the main callback URL.
 * The `notificationId` property is the notification ID.
 */
export declare class Pesapal {
    config: Iconfig;
    notificationId: string;
    defaultHeaders: {
        Accept: string;
        'Content-Type': string;
    };
    ipns: IipnResponse[];
    pesapalUrl: string;
    token: IpesaPalToken;
    constructor(config: Iconfig);
    /**
     * Intercepts Axios requests and adds the PesaPal token to the Authorization header if it is available.
     * This ensures that the PesaPal token is included in all outgoing requests.
     */
    interceptAxios(): void;
    /**
   * This method registers the IPN URL with PesaPal.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   */
    registerIpn(ipn?: string, notificationMethodType?: TnotificationMethodType): Promise<IregisterIpnRes>;
    /**
   * This method gets the IPN endpoints from PesaPal.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   */
    getIpnEndPoints(): Promise<IgetIpnEndPointsRes>;
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
    submitOrder(paymentDetails: IpayDetails, productId: string, description: string): Promise<IsubmitOrderRes>;
    /**
   * This method gets the transaction status from PesaPal.
   * The method takes the following parameters:
   * * `orderTrackingId`: The order tracking ID.
   *
   * The method returns a promise with the following properties:
   * * `success`: Indicates whether the request was successful.
   * * `response`: The response from PesaPal.
   */
    getTransactionStatus(orderTrackingId: string): Promise<IgetTransactionStatusRes>;
    /**
     * Sends a refund request for a transaction.
     * @param refunReqObj - The refund request object.
     * @returns A promise that resolves to the refund request response.
     */
    refundRequest(refunReqObj: IrefundRequestReq): Promise<IrefundRequestResComplete>;
    /**
   * This method gets the PesaPal token.
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   * * `err`: The error, if any.
   */
    getToken(): Promise<IgetTokenRes>;
    private tokenExpired;
    /**
   * This method checks the status of the token and creates a new token if it is expired.
   *
   * The method returns a promise with the following properties:
   *
   * * `success`: Indicates whether the request was successful.
   * * `madeNewToken`: Indicates whether a new token was created.
   */
    private relegateTokenStatus;
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
    private constructParamsFromObj;
    /**
   * This method checks if the token is present.
   * The method returns `true` if the token is present, and `false` otherwise.
   */
    private hasToken;
}
