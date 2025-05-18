/* eslint-disable @typescript-eslint/ban-ts-comment */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Iconfig, initialisePesapal } from './init';
import { Pesapal } from './utils/pesapal';

const pesapalInstHoisted = vi.hoisted(() => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('./controllers/pesapal.controller', async() => {
  const actual: object = await vi.importActual('./controllers/pesapal.controller');

  return {
    ...actual,
    logger: pesapalInstHoisted.logger
  };
});

describe('Pesapal', () => {
  let config: Iconfig;

  beforeEach(() => {
    config = {
      PESAPAL_ENVIRONMENT: 'sandbox',
      PESAPAL_CONSUMER_KEY: 'TDpigBOOhs+zAl8cwH2Fl82jJGyD8xev',
      PESAPAL_CONSUMER_SECRET: '1KpqkfsMaihIcOlhnBo/gBZ5smw=',
      PESAPAL_IPN_URL: 'http://localhost:4000/payment'
    };
  });

  it('initialisePesapal should return an instance of Pesapal', async() => {
    const spy1 = vi.spyOn(Pesapal.prototype, 'registerIpn').mockResolvedValueOnce({ success: true });
    const spy2 = vi.spyOn(Pesapal.prototype, 'getIpnEndPoints').mockResolvedValueOnce({ success: true });
    const paymentInstance = await initialisePesapal(config);

    expect(paymentInstance).toBeInstanceOf(Pesapal);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
});
