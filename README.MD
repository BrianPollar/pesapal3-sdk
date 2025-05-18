# pesapal3-sdk

A Node.js library for integrating PesaPal payment services into your applications.
It provides a comprehensive, type-safe interface for payment-related operations

## PesaPal API Integration

This project connects to the PesaPal API to handle payments. Here’s what it does:

- **Get Tokens**: Retrieves tokens needed to make secure API requests.
- **Handle Payments**: Listens for payment notifications from PesaPal (IPN).

## Key Dependencies

The project relies on several important packages:

- **For Production**:
  - `axios`: Used to send HTTP requests.
  - `axios-mock-adapter`: Helps in testing by mocking requests.
  - `log4js`: Used for logging messages.
  - `tracer`: Assists with debugging.
- **For Development**:
  - ESLint plugins for maintaining code quality.
  - TypeScript for adding type safety.
  - Testing tools like `supertest` and `vitest`.

## Logging

The application logs important information using `log4js`. You can find these logs in the `pesapal.log` file, which helps in debugging issues.

## IPN Notifications

Make sure to set up your IPN URL in your PesaPal account settings so that the application can receive payment notifications.

## Installation

with npm

```bash
npm install pesapal3-sdk
```

with yarn

```bash
yarn add pesapal3-sdk
```

## Usage

```ts
import { initialisePesapal, Iconfig, IpayDetails } from "pesapal3-sdk";

// this credentials are from your PesaPal account, login or register here: https://pesapal.com/
const config: Iconfig = {
  PESAPAL_ENVIRONMENT: "live", // or "sandbox"
  PESAPAL_CONSUMER_KEY: "your-consumer-key",
  PESAPAL_CONSUMER_SECRET: "your-consumer-secret",
  PESAPAL_IPN_URL: "https://yourserverdomain/pesapal/ipn",
};

const paymentInstance = initialisePesapal(config);

const details: IpayDetails = {
  amount: 1000,
  currency: "USD",
  description: "This is a test payment",
  // ...other_details
};

const ordered = await paymentInstance.submitOrder(
  details,
  "ProductId",
  "description"
);

if (ordered.success) {
  console.log(ordered.response);
} else {
  console.error(ordered.error);
}

// Handle IPN callback, this is the endpoint that PesaPal will call when a payment is completed and must be registered in your PesaPal account
// for express.js
app.get("/ipn", async (req, res) => {
  const currntUrl = new URL(req.url);
  const searchParams = currntUrl.searchParams;

  const orderTrackingId = searchParams.get("OrderTrackingId") as string;
  const orderNotificationType = searchParams.get(
    "OrderNotificationType"
  ) as string;
  const orderMerchantReference = searchParams.get(
    "OrderMerchantReference"
  ) as string;

  if (!paymentInstance) {
    // choose how to handle this error
    // may be just return a response
    return res
      .status(500)
      .send({ success: false, err: "internal server error or something else" });
  }

  const response = await paymentInstance.getTransactionStatus(orderTrackingId);
  return response;
});
```

## Documentation

Complete documentation is available on [PESAPAL3](https://pesapal3-docs.eagleinfosolutions.com).

## License

pesapal3-sdk is licensed under the [MIT License](LICENSE).
