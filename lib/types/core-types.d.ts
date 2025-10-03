/**
 * Represents an error object returned by the PesaPal API
 * @interface IpesaPalError
 * @property {string} type - The type/category of the error
 * @property {string} code - A unique error code identifying the specific error
 * @property {string} message - Human-readable error message describing the issue
 */
export interface IpesaPalError {
    type: string;
    code: string;
    message: string;
}
/**
 * Represents an authentication token response from PesaPal
 * @interface IpesaPalToken
 * @property {string | null} token - The authentication token, or null if authentication failed
 * @property {string} expiryDate - ISO 8601 timestamp when the token expires
 * @property {string | IpesaPalError} error - Error details if authentication failed, or error message as string
 * @property {string} status - The status of the token request (e.g., '200' for success)
 * @property {string} message - Human-readable status message
 */
export interface IpesaPalToken {
    token: string | null;
    expiryDate: string;
    error: string | IpesaPalError;
    status: string;
    message: string;
}
/**
 * Represents a response for IPN (Instant Payment Notification) registration
 * @interface IipnResponse
 * @property {string} url - The registered IPN URL
 * @property {string} created_date - ISO 8601 timestamp when the IPN was created
 * @property {string} ipn_id - Unique identifier for the registered IPN
 * @property {string | IpesaPalError} error - Error details if registration failed
 * @property {string} status - The status of the IPN registration
 */
export interface IipnResponse {
    url: string;
    created_date: string;
    ipn_id: string;
    error: string | IpesaPalError;
    status: string;
}
/**
 * Represents a registered IPIN (Instant Payment Identification Number)
 * @interface IregisteredIpin
 * @property {string} url - The URL associated with the registered IPIN
 * @property {string} created_date - ISO 8601 timestamp when the IPIN was created
 * @property {string} ipn_id - Unique identifier for the IPIN
 * @property {string | IpesaPalError} error - Error details if registration failed
 * @property {string} status - The status of the IPIN registration
 */
export interface IregisteredIpin {
    url: string;
    created_date: string;
    ipn_id: string;
    error: string | IpesaPalError;
    status: string;
}
/**
 * Represents billing address information for a payment
 * @interface IBillingAddress
 * @property {string} email_address - Customer's email address
 * @property {string} phone_number - Customer's phone number
 * @property {string} country_code - ISO country code (e.g., 'KE' for Kenya)
 * @property {string} first_name - Customer's first name
 * @property {string} middle_name - Customer's middle name (optional)
 * @property {string} last_name - Customer's last name
 * @property {string} line_1 - First line of the address
 * @property {string} line_2 - Second line of the address (optional)
 * @property {string} city - City name
 * @property {string} state - State/province/region
 * @property {string} postal_code - Postal/ZIP code
 * @property {string} zip_code - Alternative to postal code (some regions)
 */
interface IBillingAddress {
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
}
/**
 * Represents subscription details for recurring payments
 * @interface ISubscriptionDetails
 * @property {string} start_date - ISO 8601 date when the subscription starts
 * @property {string} end_date - ISO 8601 date when the subscription ends
 * @property {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} frequency - Billing frequency
 */
interface ISubscriptionDetails {
    start_date: string;
    end_date: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}
/**
 * Represents payment details for a transaction
 * @interface IpayDetails
 * @property {string} id - Unique identifier for the payment
 * @property {string} currency - ISO 4217 currency code (e.g., 'KES', 'USD')
 * @property {number} amount - Payment amount in the specified currency
 * @property {string} description - Description of the payment
 * @property {string} callback_url - URL to redirect after payment completion
 * @property {string} notification_id - Unique ID for payment notifications
 * @property {IBillingAddress} billing_address - Customer's billing information
 * @property {string} [account_number] - Account number for recurring payments (optional)
 * @property {ISubscriptionDetails} [subscription_details] - Recurring payment details (optional)
 */
export interface IpayDetails {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id?: string;
    notification_ipn_url?: string;
    billing_address: IBillingAddress;
    account_number?: string;
    subscription_details?: ISubscriptionDetails;
}
/**
 * Represents the response when creating an order
 * @interface IorderResponse
 * @property {string} order_tracking_id - Unique identifier for tracking the order
 * @property {string} merchant_reference - Merchant's reference for the order
 * @property {string} redirect_url - URL to redirect the customer for payment
 * @property {string | IpesaPalError} error - Error details if order creation failed
 * @property {string} status - Status of the order creation request
 */
export interface IorderResponse {
    order_tracking_id: string;
    merchant_reference: string;
    redirect_url: string;
    error: string | IpesaPalError;
    status: string;
}
/**
 * Represents a response for getting transaction status
 * @interface IgetTransactionStatusRes
 * @property {string} payment_method - Payment method used for the transaction
 * @property {number} amount - Transaction amount
 * @property {string} created_date - ISO 8601 timestamp when the transaction was created
 * @property {string} confirmation_code - Confirmation code for the transaction
 * @property {string} payment_status_description - Description of the transaction status
 * @property {string} description - Description of the transaction
 * @property {string} message - Human-readable status message
 * @property {string} payment_account - Payment account used for the transaction
 * @property {string} call_back_url - URL to call back when the transaction is processed
 * @property {number} status_code - Status code of the transaction
 * @property {string} merchant_reference - Merchant's reference for the transaction
 * @property {string} payment_status_code - Payment status code
 * @property {string} currency - ISO 4217 currency code (e.g., 'KES', 'USD')
 * @property {{ error_type: null; code: null; message: null;
 * call_back_url: null; }} error - Error details if transaction retrieval failed
 * @property {string} status - Status of the transaction retrieval request
 */
export interface IgetTransactionStatusRes {
    payment_method: string;
    amount: number;
    created_date: string;
    confirmation_code: string;
    payment_status_description: string;
    description: string;
    message: string;
    payment_account: string;
    call_back_url: string;
    status_code: number;
    merchant_reference: string;
    payment_status_code: string;
    currency: string;
    error: {
        error_type: null;
        code: null;
        message: null;
        call_back_url: null;
    };
    status: string;
}
/**
 * Interface representing the response of a refund request completion.
 * @interface IrefundRequestResComplete
 * @property {boolean} success - Whether the refund request was successful
 * @property {string} [err] - Error message if the refund request failed
 * @property {IrefundRequestRes} [refundRequestRes] - Refund request response if successful
 */
export interface IrefundRequestResComplete {
    success: boolean;
    err?: string;
    refundRequestRes?: IrefundRequestRes;
}
/**
 * Interface representing a refund request.
 * @interface IrefundRequestReq
 * @property {string} confirmation_code - Confirmation code for the refund request
 * @property {string} amount - Refund amount
 * @property {string} username - Username for the refund request
 * @property {string} remarks - Remarks for the refund request
 */
export interface IrefundRequestReq {
    confirmation_code: string;
    amount: string;
    username: string;
    remarks: string;
}
/**
 * Interface representing the response of a refund request.
 * @interface IrefundRequestRes
 * @property {string} status - Status of the refund request
 * @property {string} message - Human-readable status message
 */
export interface IrefundRequestRes {
    status: string;
    message: string;
}
/**
 * Interface representing the response of a token request.
 * @interface IgetTokenRes
 * @property {boolean} success - Whether the token request was successful
 * @property {*} [err] - Error details if the token request failed
 */
export interface IgetTokenRes {
    success: boolean;
    err?: any;
}
/**
 * Interface representing the response of an IPN registration request.
 * @interface IregisterIpnRes
 * @property {boolean} success - Whether the IPN registration request was successful
 * @property {*} [err] - Error details if the IPN registration request failed
 */
export interface IregisterIpnRes {
    success: boolean;
    err?: any;
}
/**
 * Interface representing the response of a token status request.
 * @interface IrelegateTokenStatusRes
 * @property {boolean} success - Whether the token status request was successful
 * @property {boolean} madeNewToken - Whether a new token was created
 */
export interface IrelegateTokenStatusRes {
    success: boolean;
    madeNewToken: boolean;
}
/**
 * Interface representing the response of an IPN endpoints request.
 * @interface IgetIpnEndPointsRes
 * @property {boolean} success - Whether the IPN endpoints request was successful
 * @property {*} [err] - Error details if the IPN endpoints request failed
 */
export interface IgetIpnEndPointsRes {
    success: boolean;
    err?: any;
}
/**
 * Interface representing the response of an order submission request.
 * @interface IsubmitOrderRes
 * @property {boolean} success - Whether the order submission request was successful
 * @property {number} [status] - Status code of the order submission request
 * @property {IorderResponse} [pesaPalOrderRes] - PesaPal order response if successful
 * @property {*} [err] - Error details if the order submission request failed
 */
export interface IsubmitOrderRes {
    success: boolean;
    status?: number;
    pesaPalOrderRes?: IorderResponse;
    err?: any;
}
/**
 * Defines the type of notification method, either 'GET' or 'POST'.
 * @typedef {'GET'|'POST'} TnotificationMethodType
 */
export type TnotificationMethodType = 'GET' | 'POST';
export {};
