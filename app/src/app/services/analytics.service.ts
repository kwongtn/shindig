import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

declare let gtag: Function;

@Injectable({
    providedIn: "root",
})
export class AnalyticsService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    trackPageview(path: string) {
        if (isPlatformBrowser(this.platformId)) {
            try {
                gtag("event", "page_view", {
                    page_path: path,
                });
            } catch (err) {
                console.error("Error tracking pageview:", err);
            }
        }
    }

    trackEvent(eventName: string, eventParams: {}) {
        if (isPlatformBrowser(this.platformId)) {
            try {
                gtag("event", eventName, eventParams);
            } catch (err) {
                console.error("Error tracking event:", err);
            }
        }
    }
}
