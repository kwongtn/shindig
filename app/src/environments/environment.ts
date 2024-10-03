import { CommonEnvironment, IEnvironment } from "./environment.common";

export const environment: IEnvironment = {
    ...CommonEnvironment,
    firebase: {
        useEmulators: true,
    },
    sentry: {
        dsn: undefined,
        environment: "local",
    },
};
