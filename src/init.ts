/* eslint-disable @typescript-eslint/naming-convention */
/**
 * The Pesapal class is responsible for managing the configuration and initialization of the PesaPal payment gateway.
 *
 * The class takes a configuration object of type `Iconfig` in the constructor,
 * which defines the necessary settings for the PesaPal integration, such as
 * the environment, consumer key, consumer secret, IPN URL, and callback URL.
 *
 * The `run()` method is used to initialize the PesaPal payment gateway
 * by registering the IPN endpoint and retrieving the IPN endpoints.
 * It returns the instance of the `PesaPalController` class, which can be used to interact with the PesaPal API.
 */
import { PesaPalInvalidConfigError } from './utils/error-handler';
import { Pesapal } from './utils/pesapal';

/**
 * This interface defines the configuration for PesaPal.
 */
export interface Iconfig {

  /**
   * The environment for PesaPal.
   *
   * Can be either `sandbox` or `live`.
   */
  PESAPAL_ENVIRONMENT: 'sandbox' | 'live';

  /**
   * The consumer key for PesaPal.
   */
  PESAPAL_CONSUMER_KEY: string;

  /**
   * The consumer secret for PesaPal.
   */
  PESAPAL_CONSUMER_SECRET: string;

  /**
   * The IPN URL for PesaPal.
   */
  PESAPAL_IPN_URLS: string[];
}


export const initialisePesapal = async(config: Iconfig) => {
  // validate config
  if (!config.PESAPAL_ENVIRONMENT ||
    !config.PESAPAL_CONSUMER_KEY ||
    !config.PESAPAL_CONSUMER_SECRET ||
    !config.PESAPAL_IPN_URLS) {
    throw new PesaPalInvalidConfigError('Invalid configuration');
  }

  if (!Array.isArray(config.PESAPAL_IPN_URLS)) {
    throw new PesaPalInvalidConfigError('Invalid IPN URLS');
  }

  if (config.PESAPAL_IPN_URLS.length === 0) {
    throw new PesaPalInvalidConfigError('Invalid IPN URLS');
  }

  // must have valid urls
  config.PESAPAL_IPN_URLS.forEach((url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new PesaPalInvalidConfigError('Invalid IPN URLS');
    }

    // regex to validate url
    const urlRegex = /^(http|https):\/\/(www\.)?[a-z0-9\-\.]{3,}\.[a-z]{3}\b([a-z\-\.]*\/)*$/;

    if (!urlRegex.test(url)) {
      throw new PesaPalInvalidConfigError('Invalid IPN URLS');
    }
  });

  const paymentInstance = new Pesapal(config);

  const promises = config.PESAPAL_IPN_URLS.map((url) => {
    return paymentInstance.registerIpn(url);
  });

  await Promise.all(promises);

  await paymentInstance.getIpnEndPoints();

  return paymentInstance;
};
