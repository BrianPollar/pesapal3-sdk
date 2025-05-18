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
    PESAPAL_IPN_URL: string;
}
export declare const initialisePesapal: (config: Iconfig) => Promise<Pesapal>;
