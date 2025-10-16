import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0', // Replace with your Sentry DSN
  tracesSampleRate: 1.0,
  debug: false,
});