"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialisePesapal = void 0;
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
const error_handler_1 = require("./utils/error-handler");
const pesapal_1 = require("./utils/pesapal");
const initialisePesapal = async (config) => {
    // validate config
    if (!config.PESAPAL_ENVIRONMENT ||
        !config.PESAPAL_CONSUMER_KEY ||
        !config.PESAPAL_CONSUMER_SECRET ||
        !config.PESAPAL_IPN_URLS) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid configuration');
    }
    if (!Array.isArray(config.PESAPAL_IPN_URLS)) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS');
    }
    if (config.PESAPAL_IPN_URLS.length === 0) {
        throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS');
    }
    // must have valid urls
    config.PESAPAL_IPN_URLS.forEach((url) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS');
        }
        // regex to validate url
        const urlRegex = /^(http|https):\/\/(localhost(:\d{1,5})?|(www\.)?[a-z0-9\-.]{1,}\.[a-z]{2,})([\/?#].*)?$/i;
        if (!urlRegex.test(url)) {
            throw new error_handler_1.PesaPalInvalidConfigError('Invalid IPN URLS');
        }
    });
    const paymentInstance = new pesapal_1.Pesapal(config);
    const promises = config.PESAPAL_IPN_URLS.map((url) => {
        return paymentInstance.registerIpn(url);
    });
    await Promise.all(promises);
    await paymentInstance.getIpnEndPoints();
    return paymentInstance;
};
exports.initialisePesapal = initialisePesapal;
//# sourceMappingURL=init.js.map