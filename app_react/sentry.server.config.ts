// This file configures the Sentry Next.js SDK.

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only initialize Sentry in production or when explicitly enabled for development
if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true') {
  Sentry.init({
    dsn: SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0', // Replace with your Sentry DSN
    tracesSampleRate: 0.5, // Capture 50% of server-side transactions
    debug: process.env.NODE_ENV === 'development', // Enable SDK debug mode in development
  });
}