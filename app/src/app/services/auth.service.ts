import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import {
    Auth,
    authState,
    GoogleAuthProvider,
    ParsedToken,
    signInWithPopup,
    signOut,
    Unsubscribe,
    User,
} from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";

import { NotificationService } from "./notification.service";

export interface UserAuthData {
    permissions?: {
        admin?: boolean;
    };
}

export interface CustomClaims {
    isAdmin?: boolean;
}

@Injectable({
    providedIn: "root",
})
export class AuthService {
    authState$: Observable<any>;
    authStateSubscription: Subscription;

    userData: BehaviorSubject<User | null | undefined> = new BehaviorSubject<
        User | null | undefined
    >(undefined);

    customClaims: BehaviorSubject<ParsedToken | undefined> =
        new BehaviorSubject<ParsedToken | undefined>(undefined);

    userAuth: BehaviorSubject<UserAuthData | null | undefined> =
        new BehaviorSubject<UserAuthData | null | undefined>(null);
    public readonly userAuth$: Observable<UserAuthData | undefined | null> =
        this.userAuth.asObservable();

    loginViaLoginFunction: boolean = false;
    unsubscribe: Unsubscribe | undefined = undefined;

    isLastLoggedIn: boolean = false;

    constructor(
        private router: Router,
        private notification: NotificationService,
        private auth: Auth,
        private firestore: Firestore,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.isLastLoggedIn = !!localStorage.getItem("isLastLoggedIn");
        } else {
            this.isLastLoggedIn = false;
        }

        this.authState$ = authState(this.auth);
        this.authStateSubscription = this.authState$.subscribe(
            (user: User | null) => {
                if (user) {
                    this.userData.next(user);
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem("isLastLoggedIn", "true");
                    }
                    this.isLastLoggedIn = true;

                    user.getIdTokenResult().then((token) => {
                        this.customClaims.next(token.claims);
                    });
                } else {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.removeItem("isLastLoggedIn");
                    }

                    this.isLastLoggedIn = false;
                }
            }
        );

        this.userData.subscribe((user) => {
            this.sentrySetUser(user);

            // if (user) {
            //     this.unsubscribe = onSnapshot(
            //         doc(this.firestore, "users", user.uid),
            //         (doc) => {
            //             const exists = doc.exists();
            //             if (exists) {
            //                 const data = doc.data();
            //                 this.userAuth.next(data);

            //                 if (!isUserAllowed(data, this.router.url)) {
            //                     this.router.navigate([""]);
            //                 }
            //             }
            //         }
            //     );
            // } else if (user === null) {
            //     this.userAuth.next(undefined);

            //     if (this.unsubscribe) {
            //         this.unsubscribe();
            //     }

            //     if (!isUserAllowed(undefined, this.router.url)) {
            //         this.router.navigate([""]);
            //     }
            // }
        });
    }

    login() {
        signInWithPopup(this.auth, new GoogleAuthProvider())
            .then((res) => {
                let toastMessage: string;
                if (res.user.metadata.lastSignInTime) {
                    toastMessage = `Welcome back, ${
                        res.user.displayName ?? res.user.email
                    }`;
                } else {
                    toastMessage = "Welcome!";
                }

                this.notification.success("Login Successful", toastMessage);

                console.log(res);
                this.userData.next(res.user);
            })
            .catch((reason) => {
                console.log("Login failed: ", reason);

                if ("auth/user-disabled" === reason.code) {
                    this.notification.error(
                        "Account Banned",
                        "Your account has been banned by an administrator. If you think this is an error, please contact us at 'tungnan5636@gmail.com'.",
                        {
                            nzPlacement: "top",
                            nzDuration: 0,
                        }
                    );
                } else {
                    this.notification.error("Login Error", reason.message);
                }
            });
    }

    logout() {
        signOut(this.auth)
            .then(() => {
                this.userData.next(null);
                this.notification.success(
                    "Logout Successful",
                    "Hope to see you again soon!"
                );
            })
            .catch((reason) => {
                console.log("Logout failed: ", reason);
                this.notification.error("Logout Error", reason.message);
            });
    }

    sentrySetUser(user: User | null | undefined) {
        if (user) {
            Sentry.setUser({
                email: user.email?.toString(),
                id: user.uid,
                ip_address: "{{auto}}",
            });
        } else {
            Sentry.setUser(null);
        }
    }

    getIdToken(): Promise<string> | undefined {
        return this.userData.getValue()?.getIdToken();
    }

    isLoggedIn(): boolean {
        return Boolean(this.userData.value);
    }

    isAdmin(): boolean {
        return Boolean(this.customClaims.value?.["isAdmin"]);
    }
}
