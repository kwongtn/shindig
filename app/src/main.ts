import { bootstrapApplication } from "@angular/platform-browser";
import * as Sentry from "@sentry/angular";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

Sentry.init({
  dsn: "https://7f21c7dfa3849d3e41c1f4b5c1914b83@o1331817.ingest.us.sentry.io/4508028364914688",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  // replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  // replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
