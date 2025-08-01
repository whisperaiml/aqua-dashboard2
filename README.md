## Next.js App Router Course - Final

This is the final template for the Next.js App Router Course. It contains the final code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

### PayPal configuration

To create invoices with PayPal, set the following environment variables in your `.env` file:

```
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
# Either provide a long-lived access token
PAYPAL_ACCESS_TOKEN=
# or let the app fetch one using your OAuth2 credentials
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

Without these values the application will skip the API call and return an error.
