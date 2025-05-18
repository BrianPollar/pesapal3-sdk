# pesapal3

A nodejs implementation of the pesapal payment gateway API.
A simple library for making payments with PesaPal.

## Features

pesapal3 implements a secure pesapal payment gateway for nodejs.
Its main features are:

#### Reliability

Connections are established even in the presence of:

- proxies and load balancers.
- personal firewall and antivirus software.

#### Minimalistic implementation

You do not need to understand the internal structures and operation of the systems.

#### Simple and convenient API

Sample code:

```ts
import { Pesapal, Iconfig } from "pesapal3";

const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const pesapal = new Pesapal(config);

// run the library with the configuration
const paymentInstance = await pesapal.run();

// make order
const details: IpayDetails = {
  amount: 1000,
  currency: "UGX",
  description: "This is a test payment",
  // ...other_details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

if (ordered.success) {
  // The make payment request was successful.
} else {
  // The make payment request failed.
}
```

## Installation

```bash
// with npm
npm install pesapal3

// with yarn
yarn add pesapal3
```

## How to use

The following example inits pesapal3 and gets the chat client and chat controller instances.

```ts
import { Pesapal, Iconfig, IpayDetails } from "pesapal3";

const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

// make order
const details: IpayDetails = {
  amount: 1000,
  currency: "UGX",
  description: "This is a test payment",
  // ...other_details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

if (ordered.success) {
  // The make payment request was successful.
} else {
  // The make payment request failed.
}

//check status using the order tracking id provided by pesapal

const checkStatus = await paymentInstance.getTransactionStatus(
  "orderTrackingId"
);

// provide an api ipn notfication call back
paymentRoutes.get("/ipn", async (req, res) => {
  const currntUrl = new URL(req.url);
  // get access to URLSearchParams object
  const searchParams = currntUrl.searchParams;

  // get url parameters
  const orderTrackingId = searchParams.get("OrderTrackingId") as string;
  const orderNotificationType = searchParams.get(
    "OrderNotificationType"
  ) as string;
  const orderMerchantReference = searchParams.get(
    "OrderMerchantReference"
  ) as string;

  // make sure you use main pesapal instance and not constrct another one

  if (!paymentInstance && !related) {
    return res
      .status(500)
      .send({ success: false, err: "internal server error" });
  }

  // return relegatePesaPalNotifications(orderTrackingId, orderNotificationType, orderMerchantReference);
  const response = await paymentInstance.getTransactionStatus(
    orderTrackingId,
    related._id
  );
  return response;
});
```

## Register IPN

```ts
import { PesaPalController, IrefundRequestReq } from "pesapal3";
const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

/** By default they are, as this uses the values provided in the config, but if you
 * want to specify additional ipn end points for transcation notification and response type
 * you can pass in the parameters as below
 */
const ipn = "https://myserverdomain.com";
const notificationMethodType = "GET";

const response = await registerIpn(pin, notificationMethodType);
```

## Get Ipn Endpoints

If you want to get all the registered Ipn end point you would use the getIpnEndPoints

```ts
import { PesaPalController, IrefundRequestReq } from "pesapal3";
const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

const response = await paymentInstance.getIpnEndPoints();
```

## Get Transcation Status

```ts
import { PesaPalController, IrefundRequestReq } from "pesapal3";
const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

const orderTrackingId = "15113631262323623734734";

const response = await paymentInstance.getTransactionStatus(orderTrackingId);
```

## Recurring transactions

If you want to implement recurring subscriptions, you would do it as follows

## Refund

Refund of users payment is made
you would use the api below

```ts
import { PesaPalController, IrefundRequestReq } from 'pesapal3'
const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or sandbox
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn"
};

const pesapal = new Pesapal(config);

// run the library with
const paymentInstance = pesapal.run();

// provide refund objcet
const refundRequestReq: IrefundRequestReq {
  confirmation_code: 'confirmation_code'
  amount: '100',
  username: 'John Doe',
  remarks: 'product out of stock'
}


// refundRequest
const response = await paymentInstance.refundRequest()
```

## Documentation

The full documentation for pesapal3 is available on [here](https://github.com/BrianPollar/pesapal3). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

pesapal3 is licensed under the MIT License.
[MIT](LICENSE)
