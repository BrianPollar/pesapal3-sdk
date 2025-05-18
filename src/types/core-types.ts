/* eslint-disable @typescript-eslint/naming-convention */
/**
 * This is an interface that defines an IpesaPalError.
 *
 * The `type` property indicates the type of error.
 * The `code` property indicates the code of the error.
 * The `message` property indicates the message of the error.
 */
export interface IpesaPalError {
  type: string;
  code: string;
  message: string;
}

/**
 * This is an interface that defines an IpesaPalToken.
 *
 * The `token` property is the token itself.
 * The `expiryDate` property is the expiry date of the token.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the token.
 * The `message` property is the message of the token.
 */
export interface IpesaPalToken {
  token: string | null;
  expiryDate: string;
  error: string | IpesaPalError;
  status: string;
  message: string;
}

/**
 * This is an interface that defines an IipnResponse.
 * The `url` property is the URL of the IPN.
 * The `created_date` property is the date the IPN was created.
 * The `ipn_id` property is the ID of the IPN.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the IPN.
 */
export interface IipnResponse {
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IregisteredIpin.
 *
 * The `url` property is the URL of the registered IPIN.
 * The `created_date` property is the date the IPIN was created.
 * The `ipn_id` property is the ID of the IPIN.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the IPIN.
 */
export interface IregisteredIpin {
  url: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_date: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ipn_id: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IpayDetails.
 *
 * The `id` property is the ID of the payment details.
 * The `currency` property is the currency of the payment.
 * The `amount` property is the amount of the payment.
 * The `description` property is the description of the payment.
 * The `callback_url` property is the URL to call back when the payment is processed.
 * The `notification_id` property is the ID of the notification.
 * The `billing_address` property is the billing address of the payer.
 */
export interface IpayDetails {
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
}

/**
 * This is an interface that defines an IorderResponse.
 *
 * The `order_tracking_id` property is the ID of the order.
 * The `merchant_reference` property is the merchant reference.
 * The `redirect_url` property is the URL to redirect the payer to.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the order.
 */
export interface IorderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error: string | IpesaPalError;
  status: string;
}

/**
 * This is an interface that defines an IendpointResponse.
 *
 * The `payment_method` property is the payment method used.
 * The `amount` property is the amount of the payment.
 * The `created_date` property is the date the payment was created.
 * The `confirmation_code` property is the confirmation code of the payment.
 * The `payment_status_description` property is the description of the payment status.
 * The `description` property is the description of the payment.
 * The `message` property is the message of the payment.
 * The `payment_account` property is the payment account used.
 * The `call_back_url` property is the URL to call back when the payment is processed.
 * The `status_code` property is the status code of the payment.
 * The `merchant_reference` property is the merchant reference.
 * The `payment_status_code` property is the payment status code.
 * The `currency` property is the currency of the payment.
 * The `error` property is the error, or `null` if there is no error.
 * The `status` property is the status of the payment.
 */
export interface IendpointResponse {
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
 */
export interface IrefundRequestResComplete {
  success: boolean;
  err?: string;
  refundRequestRes?: IrefundRequestRes;
}

/**
 * Interface representing a refund request.
 */
export interface IrefundRequestReq {
  confirmation_code: string;
  amount: string;
  username: string;
  remarks: string;
}

/**
 * Interface representing the response of a refund request.
 */
export interface IrefundRequestRes {
  status: string;
  message: string;
}

/**
 * This is an interface that defines an IgetTokenRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IgetTokenRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IregisterIpnRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IregisterIpnRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IrelegateTokenStatusRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `madeNewToken` property indicates whether a new token was created.
 */
export interface IrelegateTokenStatusRes {
  success: boolean;
  madeNewToken: boolean;
}

/**
 * This is an interface that defines an IgetIpnEndPointsRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `err` property is the error, if any.
 */
export interface IgetIpnEndPointsRes {
  success: boolean;
  err?;
}

/**
 * This is an interface that defines an IsubmitOrderRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `status` property is the status of the order.
 * The `pesaPalOrderRes` property is the PesaPal order response.
 * The `err` property is the error, if any.
 */
export interface IsubmitOrderRes {
  success: boolean;
  status?: number;
  pesaPalOrderRes?: IorderResponse;
  err?;
}

/**
 * This is an interface that defines an IgetTransactionStatusRes.
 *
 * The `success` property indicates whether the request was successful.
 * The `response` property is the response from PesaPal.
 * The `status` property is the status of the transaction.
 * The `err` property is the error, if any.
 */
export interface IgetTransactionStatusRes {
  success: boolean;
  response?: IendpointResponse;
  status?: string;
  err?;
}

/**
 * Defines the type of notification method, either 'GET' or 'POST'.
 */
export type TnotificationMethodType = 'GET' | 'POST';
