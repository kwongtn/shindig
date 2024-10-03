import { CommonEnvironment, IEnvironment } from "./environment.common";

export const environment: IEnvironment = {
    ...CommonEnvironment,
    firebase: {
        useEmulators: false,
    },
    sentry: {
        dsn: "https://7f21c7dfa3849d3e41c1f4b5c1914b83@o1331817.ingest.us.sentry.io/4508028364914688",
        environment: "production",
    },
};
