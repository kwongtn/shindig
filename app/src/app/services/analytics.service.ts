import { Injectable } from "@angular/core";

declare let gtag: Function;

@Injectable({
    providedIn: "root",
})
export class AnalyticsService {
    constructor() {}

    trackPageview(path: string) {
        try {
            gtag("event", "page_view", {
                page_path: path,
            });
        } catch (err) {
            console.error("Error tracking pageview:", err);
        }
    }

    trackEvent(eventName: string, eventParams: {}) {
        try {
            gtag("event", eventName, eventParams);
        } catch (err) {
            console.error("Error tracking event:", err);
        }
    }
}
