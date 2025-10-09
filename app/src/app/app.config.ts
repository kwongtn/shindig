import { en_US, provideNzI18n } from "ng-zorro-antd/i18n";
import { provideNzIcons } from "ng-zorro-antd/icon";
import { provideMarkdown } from "ngx-markdown";

import { isPlatformServer, registerLocaleData } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import en from "@angular/common/locales/en";
import {
    APP_INITIALIZER,
    ApplicationConfig,
    ErrorHandler,
    importProvidersFrom,
    inject,
    PLATFORM_ID,
    provideZoneChangeDetection,
} from "@angular/core";
import {
    getAnalytics,
    provideAnalytics,
    ScreenTrackingService,
    UserTrackingService,
} from "@angular/fire/analytics";
import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import {
    AppCheck,
    initializeAppCheck,
    provideAppCheck,
    ReCaptchaEnterpriseProvider,
    ReCaptchaV3Provider,
} from "@angular/fire/app-check";
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import {
    connectFirestoreEmulator,
    getFirestore,
    provideFirestore,
} from "@angular/fire/firestore";
import {
    connectFunctionsEmulator,
    getFunctions,
    provideFunctions,
} from "@angular/fire/functions";
import { getPerformance, providePerformance } from "@angular/fire/performance";
import { getStorage, provideStorage } from "@angular/fire/storage";
import { FormsModule } from "@angular/forms";
import { provideClientHydration } from "@angular/platform-browser";
import {
    provideAnimationsAsync,
} from "@angular/platform-browser/animations/async";
import {
    provideRouter,
    Router,
    withComponentInputBinding,
} from "@angular/router";
import * as Sentry from "@sentry/angular";

import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { icons } from "./icons-provider";

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideClientHydration(),
        provideNzIcons(icons),
        provideNzI18n(en_US),
        importProvidersFrom(FormsModule),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideFirebaseApp(() =>
            initializeApp({
                projectId: "shindig-15693",
                appId: "1:978411319677:web:253f2246e0af4691ca5c14",
                storageBucket: "shindig-15693.appspot.com",
                apiKey: "AIzaSyAO-YiMUSA9ZozZtjwB_tisYSQ50N6Wll4",
                authDomain: "shindig-15693.firebaseapp.com",
                messagingSenderId: "978411319677",
                measurementId: "G-BP5DDM9KKB",
            })
        ),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => {
            const auth = getAuth();
            if (environment.firebase.useEmulators) {
                connectAuthEmulator(auth, "http://127.0.0.1:9099");
            }
            return auth;
        }),
        ScreenTrackingService,
        UserTrackingService,
        provideAppCheck(() => {
            if (environment.firebase.useEmulators) {
                return undefined as unknown as AppCheck;
            }
            // Don't initialise AppCheck if running in server
            // Workaround for https://github.com/angular/angularfire/issues/3488
            const platformId = inject(PLATFORM_ID);
            if (isPlatformServer(platformId)) {
                return undefined as unknown as AppCheck;
            }

            const key = environment.recaptcha.key;
            return initializeAppCheck(getApp(), {
                provider: environment.recaptcha.isEnterprise
                    ? new ReCaptchaEnterpriseProvider(key)
                    : new ReCaptchaV3Provider(key),
                isTokenAutoRefreshEnabled: true,
            });
        }),
        provideFirestore(() => {
            const db = getFirestore();

            if (
                environment.firebase.useEmulators &&
                !(db as any)._settingsFrozen
            ) {
                connectFirestoreEmulator(db, "localhost", 8080);
            }
            return db;
        }),
        provideFunctions(() => {
            const func = getFunctions();
            if (environment.firebase.useEmulators) {
                connectFunctionsEmulator(func, "localhost", 5001);
            }
            return func;
        }),
        providePerformance(() => getPerformance()),
        provideStorage(() => getStorage()),
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler(),
        },
        {
            provide: Sentry.TraceService,
            deps: [Router],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => {},
            deps: [Sentry.TraceService],
            multi: true,
        },
        provideMarkdown(),
    ],
};
