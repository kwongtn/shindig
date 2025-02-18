import { Timestamp } from "@angular/fire/firestore";

export function getIdealModalWidth(screenSize: number): string {
    /**
     * Returns modal width size according to screen size.
     *
     * Xs   : <576px
     * Sm   : ≥576px
     * Md   : ≥768px
     * Lg   : ≥992px
     * Xl   : ≥1200px
     * XXl  : ≥1600px
     *
     * Logic table is verbosely written for ease of maintenance.
     */
    if (screenSize < 576) {
        return "calc(100vw - 32px)";
    } else if (screenSize < 768) {
        return "calc(100vw - 32px)";
    } else if (screenSize < 992) {
        return "calc(100vw - 32px)";
    } else if (screenSize < 1200) {
        return "calc(100vw - 128px)";
    } else if (screenSize < 1600) {
        return "calc(100vw - 512px)";
    } else {
        return "calc(100vw - 512px)";
    }
}

export function getCurrentLocalDate(): string {
    return new Date(
        new Date().valueOf() - new Date().getTimezoneOffset() * 60000
    )
        .toISOString()
        .split("T")[0];
}

export function unifyTimestampDate(a: Timestamp | Date): Date {
    if (a instanceof Timestamp) {
        return new Date(a.toMillis());
    } else {
        return a;
    }
}
