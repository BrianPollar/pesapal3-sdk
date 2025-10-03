/**
 * @file PesaPal SDK Initialization
 * @description Provides configuration and initialization for the PesaPal payment gateway integration
 * @module init
 */
import { TnotificationMethodType } from './types/core-types';
import { Pesapal } from './utils/pesapal';
/**
 * Configuration interface for PesaPal SDK initialization
 * @interface Iconfig
 * @property {'sandbox' | 'live'} PESAPAL_ENVIRONMENT - The environment for PesaPal ('sandbox' or 'live')
 * @property {string} PESAPAL_CONSUMER_KEY - The consumer key for PesaPal API authentication
 * @property {string} PESAPAL_CONSUMER_SECRET - The consumer secret for PesaPal API authentication
 * @property {string[]} PESAPAL_IPN_URLS - Array of Instant Payment Notification (IPN) URLs to register
 */
export interface Iconfig {
    /**
     * The environment for PesaPal integration
     * @type {'sandbox' | 'live'}
     */
    PESAPAL_ENVIRONMENT: 'sandbox' | 'live';
    /**
     * The consumer key for PesaPal API authentication
     * @type {string}
     */
    PESAPAL_CONSUMER_KEY: string;
    /**
     * The consumer secret for PesaPal API authentication
     * @type {string}
     */
    PESAPAL_CONSUMER_SECRET: string;
    /**
     * Array of Instant Payment Notification (IPN) URLs to register with PesaPal
     * These URLs will receive payment status updates
     * @type {string[]}
     */
    PESAPAL_IPN_URLS: {
        url: string;
        /**
         * The notification method type for the IPN URL
         * default is GET
         * @type {TnotificationMethodType}
         */
        notificationMethodType?: TnotificationMethodType;
    }[];
    /**
     * The delay in milliseconds between IPN registrations
     * default is 10000
     * @type {number}
     */
    PESAPAL_IPN_DELAY?: number;
}
/**
 * Initializes and configures the PesaPal payment gateway
 * @async
 * @function initialisePesapal
 * @param {Iconfig} config - Configuration object for PesaPal integration
 * @returns {Promise<Pesapal>} A promise that resolves to an initialized Pesapal instance
 * @throws {PesaPalInvalidConfigError} If the configuration is invalid
 * @throws {Error} If IPN registration or endpoint retrieval fails
 *
 * @example
 * const config = {
 *   PESAPAL_ENVIRONMENT: 'sandbox',
 *   PESAPAL_CONSUMER_KEY: 'your-consumer-key',
 *   PESAPAL_CONSUMER_SECRET: 'your-consumer-secret',
 *   PESAPAL_IPN_URLS: ['https://your-domain.com/ipn']
 * };
 *
 * try {
 *   const pesapal = await initialisePesapal(config);
 *   // Use pesapal instance for payment operations
 * } catch (error) {
 *   console.error('Initialization failed:', error);
 * }
 */
export declare const initialisePesapal: (config: Iconfig) => Promise<Pesapal>;
