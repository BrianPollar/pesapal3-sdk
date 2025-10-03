"use strict";
/**
 * @file PesaPal SDK Initialization
 * @description Provides configuration and initialization for the PesaPal payment gateway integration
 * @module init
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialisePesapal = void 0;
const error_handler_1 = require("./utils/error-handler");
const pesapal_1 = require("./utils/pesapal");
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
const initialisePesapal = async (config) => {
    // Validate required configuration
    if (!config.PESAPAL_ENVIRONMENT ||
        !config.PESAPAL_CONSUMER_KEY ||
        !config.PESAPAL_CONSUMER_SECRET ||
        !config.PESAPAL_IPN_URLS) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid configuration: Missing required fields');
    }
    // Validate IPN URLs array
    if (!Array.isArray(config.PESAPAL_IPN_URLS)) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS: Must be an array');
    }
    if (config.PESAPAL_IPN_URLS.length === 0) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS: Array cannot be empty');
    }
    // Validate URL format for each IPN URL
    config.PESAPAL_IPN_URLS.forEach((url) => {
        if (!url.url.startsWith('http://') && !url.url.startsWith('https://')) {
            throw new error_handler_1.PesaPalInvalidConfigError(`Invalid IPN URL: ${url.url} - Must start with http:// or https://`);
        }
        // Regex to validate URL format
        const urlRegex = /^(http|https):\/\/(localhost(:\d{1,5})?|(www\.)?[a-z0-9\-.]+\.[a-z]{2,})([\/?#].*)?$/i;
        if (!urlRegex.test(url.url)) {
            throw new error_handler_1.PesaPalInvalidConfigError(`Invalid IPN URL format: ${url.url}`);
        }
    });
    // Initialize Pesapal instance
    const paymentInstance = new pesapal_1.Pesapal(config);
    try {
        const sleep = (ms) => new Promise(resolve => {
            // Note: setTimeout is the standard way to block execution in JS
            // We use a Promise to make it compatible with 'await'.
            setTimeout(resolve, ms);
        });
        // --- Your Original Code Modified ---
        const DELAY_MS = config.PESAPAL_IPN_DELAY || 10000; // 10 seconds
        // Register all IPN URLs in parallel
        // go one by one
        for (const url of config.PESAPAL_IPN_URLS) {
            await paymentInstance.registerIpn(url.url, url.notificationMethodType);
            // Check if there are more URLs to process.
            // We pause *after* a successful call, unless it was the very last one.
            const currentIndex = config.PESAPAL_IPN_URLS.indexOf(url);
            const isLastUrl = currentIndex === config.PESAPAL_IPN_URLS.length - 1;
            if (!isLastUrl) {
                // Pause for 10 seconds before starting the next iteration
                pesapal_1.logger.info(`Pausing for ${DELAY_MS / 1000} seconds to avoid rate limiting...`);
                await sleep(DELAY_MS);
            }
        }
        // Refresh IPN endpoints
        await paymentInstance.getIpnEndPoints();
        return paymentInstance;
    }
    catch (error) {
        throw new Error(`Failed to initialize PesaPal: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.initialisePesapal = initialisePesapal;
//# sourceMappingURL=init.js.map