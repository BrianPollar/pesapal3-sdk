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
const pesapal_1 = require("./utils/pesapal");
const initialisePesapal = async (config) => {
    const paymentInstance = new pesapal_1.Pesapal(config);
    await paymentInstance.registerIpn();
    await paymentInstance.getIpnEndPoints();
    return paymentInstance;
};
exports.initialisePesapal = initialisePesapal;
//# sourceMappingURL=init.js.map