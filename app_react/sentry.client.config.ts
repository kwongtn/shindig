// This file configures the Sentry Next.js SDK.

// When the Sentry SDK is initialized in the Next.js middleware or in a Next.js request handler,
// the Sentry SDK automatically adds information about the request to the event.
// However, in some cases, you may want to add additional information about the request to the event.
// This can be done by using the `beforeSend` callback.
// The `beforeSend` callback is called before each event is sent to Sentry.
// The callback can be used to modify the event or to discard the event by returning null.

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Only initialize Sentry in production or when explicitly enabled for development
if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true') {
  Sentry.init({
    dsn: SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0', // Replace with your Sentry DSN
    tracesSampleRate: 0.5, // Capture 50% of transactions
    debug: process.env.NODE_ENV === 'development', // Enable SDK debug mode in development
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}