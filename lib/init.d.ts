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
export declare const initialisePesapal: (config: Iconfig) => Promise<Pesapal>;
