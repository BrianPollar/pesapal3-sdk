/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undefined */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/naming-convention */
import { faker } from '@faker-js/faker';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Iconfig } from '../init';
import {
    IpayDetails,
    IpesaPalError,
    IpesaPalToken,
    IrefundRequestReq
} from '../types/core-types';
import { createMockPayDetails, Pesapal, stringifyIfObj } from './pesapal';

const pesapalInstHoisted = vi.hoisted(() => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('./pesapal.controller', async() => {
  const actual: object = await vi.importActual('./pesapal.controller');

  return {
    ...actual,
    logger: pesapalInstHoisted.logger
  };
});


const makeRandomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const mockAxios = new MockAdapter(axios);

export const errorMock: IpesaPalError = {
  type: 'error',
  code: '500',
  message: 'some error'
};

const pesaplTokenresSuccess: IpesaPalToken = {
  token: makeRandomString(11),
  expiryDate: new Date('12/12/2025').toString(),
  error: '',
  status: 'status',
  message: 'message'
};

const pesaplTokenresFailure: IpesaPalToken = {
  token: null,
  expiryDate: new Date().toString(),
  error: errorMock,
  status: 'status',
  message: 'message'
};


describe('Payment', () => {
  let instance: Pesapal;

  beforeEach(() => {
    const config: Iconfig = {
      PESAPAL_ENVIRONMENT: 'sandbox',
      PESAPAL_CONSUMER_KEY: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      PESAPAL_CONSUMER_SECRET: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      PESAPAL_IPN_URL: 'http://localhost:4000/payment'
    };

    instance = new Pesapal(config);
  });

  it('#getToken should get and define token successfully', async() => {
    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    // @ts-ignore
    const getTokenSpy = vi.spyOn(instance, 'getToken');
    // @ts-ignore
    const response = await instance.getToken();

    expect(getTokenSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(instance.token).toBeDefined();
    expect(instance.token).toHaveProperty('token');
    expect(typeof instance.token.token).toBe('string');
  });

  it('#getToken should fail if no token in response', async() => {
    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresFailure);
    // @ts-ignore
    const getTokenSpy = vi.spyOn(instance, 'getToken');

    await expect(instance.getToken()).rejects.toThrowError();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(instance.token).toBeUndefined();
  });

  it('#getToken should fail if no error and no token in case of unknown response', async() => {
    const meaninglesssResponse = {};

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, meaninglesssResponse);
    // @ts-ignore
    const getTokenSpy = vi.spyOn(instance, 'getToken');

    await expect(instance.getToken()).rejects.toThrowError();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(instance.token).toBeFalsy();
  });

  it('#getToken should fail if no error and no token in case of unknown response', async() => {
    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').networkError();
    // @ts-ignore
    const getTokenSpy = vi.spyOn(instance, 'getToken');

    await expect(instance.getToken()).rejects.toThrowError();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(instance.token).toBeFalsy();
  });

  it('#hasToken check instance has token defined', () => {
    // @ts-ignore
    const hasToken = instance.hasToken();

    expect(typeof hasToken).toBe('boolean');
    expectTypeOf(hasToken).toEqualTypeOf<boolean>(Boolean('true'));
  });

  it('#hasToken should return true incase token is defined', () => {
    // @ts-ignore
    instance.token = {
      token: 'token'
    };
    // @ts-ignore
    const hasToken = instance.hasToken();

    expect(typeof hasToken).toBe('boolean');
    expectTypeOf(hasToken).toEqualTypeOf<boolean>(Boolean('true'));
    expect(hasToken).toBe(true);
  });

  it('#hasToken should return false incase token is not defined', () => {
    // @ts-ignore
    instance.token = null;
    // @ts-ignore
    const hasToken = instance.hasToken();

    expect(typeof hasToken).toBe('boolean');
    expectTypeOf(hasToken).toEqualTypeOf<boolean>(Boolean('true'));
    expect(hasToken).toBe(false);
  });

  it('#relegateTokenStatus check properly if token has the right date', async() => {
    // @ts-ignore
    const hasTokenSpy = vi.spyOn(instance, 'hasToken');
    const getTokenSpy = vi.spyOn(instance, 'getToken');

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    // @ts-ignore
    const response = await instance.relegateTokenStatus();

    expect(hasTokenSpy).toHaveBeenCalled();
    expect(getTokenSpy).toHaveBeenCalled();
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('madeNewToken');
    expect(typeof response.success).toBe('boolean');
    expect(typeof response.madeNewToken).toBe('boolean');
  });

  it('#constructParamsFromObj should construct params from object', () => {
    const payDetails: IpayDetails = {
      id: faker.string.uuid(),
      currency: 'UG',
      amount: 100,
      description: faker.string.alphanumeric(),
      callback_url: 'url',
      notification_id: faker.string.uuid(),
      billing_address: {
        email_address: faker.internet.email(),
        phone_number: faker.number.int().toString(),
        country_code: 'UG',
        first_name: faker.internet.userName(),
        middle_name: faker.internet.userName(),
        last_name: faker.internet.userName(),
        line_1: faker.string.alphanumeric(),
        line_2: faker.string.alphanumeric(),
        city: faker.string.alphanumeric(),
        state: faker.string.alphanumeric(),
        postal_code: faker.string.alphanumeric(),
        zip_code: faker.number.int().toString()
      }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const obj = instance.constructParamsFromObj(
      payDetails,
      faker.string.uuid(),
      faker.string.uuid(),
      faker.string.alphanumeric()
    );

    expect(typeof obj).toBe('object');
    expect(obj).toHaveProperty('id');
    expect(obj).toHaveProperty('currency');
    expect(obj).toHaveProperty('amount');
    expect(obj).toHaveProperty('description');
    expect(obj).toHaveProperty('callback_url');
    expect(obj).toHaveProperty('notification_id');
    expect(obj).toHaveProperty('billing_address');
  });

  it('#registerIpn should registerIpn and add to ipn list', async() => {
    const mockReturnValue = {
      url: 'url',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    mockAxios.onPost(instance.pesapalUrl + '/api/URLSetup/RegisterIPN').reply(200, mockReturnValue);
    const relegateTokenStatusSpy = vi.spyOn(instance, 'registerIpn');
    const response = await instance.registerIpn();

    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns[0]).toBeDefined();
    expect(instance.ipns[0]).toHaveProperty('url');
  });

  it('#getIpnEndPoints should get getIpnEndPoints', async() => {
    const mockReturnValue = {
      url: 'http://localhost:4000',
      created_date: new Date().toString(),
      ipn_id: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    mockAxios.onGet(instance.pesapalUrl + '/api/URLSetup/GetIpnList').reply(200, [mockReturnValue]);
    // @ts-ignore
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    const response = await instance.getIpnEndPoints();

    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.err).toBeUndefined();
    expect(instance.ipns.length).toBeGreaterThan(0);
  });

  it('#submitOrder should submitOrder', async() => {
    const phone = '0756920841';
    const ipnUrl = '/url';

    instance.ipns = [
      {
        url: 'url',
        created_date: new Date().toString(),
        ipn_id: faker.string.uuid(),
        error: '',
        status: '200'
      }
    ];
    const productId = faker.string.uuid();
    const payDetails: IpayDetails = createMockPayDetails(ipnUrl, phone);
    const mockReturnValue = {
      order_tracking_id: faker.string.uuid(),
      merchant_reference: faker.string.uuid(),
      redirect_url: faker.string.uuid(),
      error: null,
      status: '200'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    mockAxios
      .onPost(instance.pesapalUrl + '/api/Transactions/SubmitOrderRequest')
      .reply(200, mockReturnValue);
    // @ts-ignore
    const relegateTokenStatusSpy = vi.spyOn(instance, 'relegateTokenStatus');
    // @ts-ignore
    const constructParamsFromObjSpy = vi.spyOn(instance, 'constructParamsFromObj');
    const res = await instance.submitOrder(payDetails, productId, faker.string.alphanumeric());

    expect(relegateTokenStatusSpy).toHaveBeenCalled();
    expect(constructParamsFromObjSpy).toHaveBeenCalled();
    expect(res).toHaveProperty('success');
    expect(res).toHaveProperty('status');
    expect(res).toHaveProperty('pesaPalOrderRes');
    expect(res.success).toBe(true);
    expect(res.status).toBe(200);
    expect(res.err).toBeUndefined();
    expect(res.pesaPalOrderRes).toHaveProperty('order_tracking_id');
  });

  it('#getTransactionStatus should get transaction status', async() => {
    const orderTrackingId = '1';
    const mockRes = {
      payment_status_description: 'completed'
    };

    /* instance.token = {
      token: 'token',
      expiryDate: faker.date.future().toString()
    } as any; */

    mockAxios
      .onGet(instance.pesapalUrl + '/api/Transactions/GetTransactionStatus?orderTrackingId=1')
      .reply(200, mockRes);
    const response = await instance.getTransactionStatus(orderTrackingId);

    expect(response.success).toBe(true);
  });

  it('#refundRequest should return success and refundRequestRes if refund request is successful', async() => {
    const refunReqObj: IrefundRequestReq = {
      confirmation_code: 'string',
      amount: 'string',
      username: 'string',
      remarks: 'string'
    };
    const refundRequestRes = {
      status: 'string',
      message: 'string'
    };
    const mockReturnValue = {
      success: true,
      refundRequestRes
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    mockAxios
      .onPost(instance.pesapalUrl + '/api/Transactions/RefundRequestt')
      .reply(200, refundRequestRes);
    const refundRequestSpy = vi.spyOn(instance, 'refundRequest');
    const response = await instance.refundRequest(refunReqObj);

    expect(refundRequestSpy).toHaveBeenCalled();
    expect(response).toHaveProperty('success');
    expect(response).toEqual(mockReturnValue);
  });

  it('#refundRequest should fail', async() => {
    const refunReqObj: IrefundRequestReq = {
      confirmation_code: 'string',
      amount: 'string',
      username: 'string',
      remarks: 'string'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Transactions/RefundRequestt').reply(401, {});

    await expect(instance.refundRequest(refunReqObj)).rejects.toThrowError();
  });

  it('#refundRequest should fail', async() => {
    const refunReqObj: IrefundRequestReq = {
      confirmation_code: 'string',
      amount: 'string',
      username: 'string',
      remarks: 'string'
    };
    const refundRequestRes = {
      status: 'string',
      message: 'string'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, null);
    mockAxios
      .onPost(instance.pesapalUrl + '/api/Transactions/RefundRequestt')
      .reply(200, refundRequestRes);

    await expect(instance.refundRequest(refunReqObj)).rejects.toThrowError();
  });

  it('#refundRequest should pass', () => {
    const refunReqObj: IrefundRequestReq = {
      confirmation_code: 'string',
      amount: 'string',
      username: 'string',
      remarks: 'string'
    };
    const refundRequestRes = {
      status: 'string',
      message: 'string'
    };

    mockAxios.onPost(instance.pesapalUrl + '/api/Auth/RequestToken').reply(200, pesaplTokenresSuccess);
    mockAxios
      .onPost(instance.pesapalUrl + '/api/Transactions/RefundRequestt')
      .reply(200, refundRequestRes);
    const refundRequestSpy = vi.spyOn(instance, 'refundRequest');

    instance.refundRequest(refunReqObj).then((res) => {
      expect(refundRequestSpy).toHaveBeenCalled();
      expect(res).toHaveProperty('success');
      expect(res).toEqual({ success: true, refundRequestRes });
    });
  });
});

describe('Utility Functions', () => {
  describe('stringifyIfObj', () => {
    it('should return string as-is when input is a string', () => {
      const input = 'test string';

      expect(stringifyIfObj(input)).toBe(input);
    });

    it('should stringify object correctly', () => {
      const input = { key: 'value', num: 42 };

      expect(stringifyIfObj(input)).toBe(JSON.stringify(input));
    });

    it('should stringify array correctly', () => {
      const input = [1, 2, 3];

      expect(stringifyIfObj(input)).toBe(JSON.stringify(input));
    });

    it('should handle null and undefined', () => {
      expect(stringifyIfObj(null)).toBe('null');
      expect(stringifyIfObj(undefined)).toBeUndefined();
    });
  });

  describe('createMockPayDetails', () => {
    const mockIpnUrl = 'http://test-ipn-url.com';
    const mockPhone = '+256123456789';

    it('should generate mock pay details with correct structure', () => {
      const mockDetails = createMockPayDetails(mockIpnUrl, mockPhone);

      expect(mockDetails).toHaveProperty('id');
      expect(mockDetails).toHaveProperty('currency', 'UGX');
      expect(mockDetails).toHaveProperty('amount', 1000);
      expect(mockDetails).toHaveProperty('callback_url', 'http://localhost:4000');
      expect(mockDetails).toHaveProperty('notification_id', mockIpnUrl);

      expect(mockDetails.billing_address).toBeDefined();
      expect(mockDetails.billing_address.phone_number).toBe(mockPhone);
    });

    it('should generate unique mock details on each call', () => {
      const details1 = createMockPayDetails(mockIpnUrl, mockPhone);
      const details2 = createMockPayDetails(mockIpnUrl, mockPhone);

      expect(details1.id).not.toBe(details2.id);
    });
  });
});

describe('Pesapal Configuration', () => {
  it('should set correct pesapal URL based on environment', () => {
    const liveConfig: Iconfig = {
      PESAPAL_ENVIRONMENT: 'live',
      PESAPAL_CONSUMER_KEY: 'test-key',
      PESAPAL_CONSUMER_SECRET: 'test-secret',
      PESAPAL_IPN_URL: 'http://live-ipn.com'
    };

    const sandboxConfig: Iconfig = {
      PESAPAL_ENVIRONMENT: 'sandbox',
      PESAPAL_CONSUMER_KEY: 'test-key',
      PESAPAL_CONSUMER_SECRET: 'test-secret',
      PESAPAL_IPN_URL: 'http://sandbox-ipn.com'
    };

    const liveInstance = new Pesapal(liveConfig);
    const sandboxInstance = new Pesapal(sandboxConfig);

    expect(liveInstance.pesapalUrl).toBe('https://pay.pesapal.com/v3');
    expect(sandboxInstance.pesapalUrl).toBe('https://cybqa.pesapal.com/pesapalv3');
  });
});
