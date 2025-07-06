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

export class CustomDate {
    constructor(
        public year: number,
        public month: number,
        public day: number | undefined
    ) {}

    toDate(): Date {
        return new Date(this.year, this.month, this.day);
    }

    toString(): string {
        const yearStr = this.year.toString();
        const monthStr = (this.month + 1).toString().padStart(2, "0");
        if (this.day === undefined) {
            return `${yearStr}-${monthStr}`;
        }

        const dayStr = this.day.toString().padStart(2, "0");
        return `${yearStr}-${monthStr}-${dayStr}`;
    }

    get type(): "year" | "month" | "day" {
        if (this.day === undefined) {
            return this.month === undefined ? "year" : "month";
        }
        return "day";
    }
}

export function getCurrentLocalDate(date: Date = new Date()): CustomDate {
    const customDate = new Date(
        date.valueOf() - new Date().getTimezoneOffset() * 60000
    )
        .toISOString()
        .split("T")[0];
    const [year, month, day] = customDate.split("-").map(Number);
    return new CustomDate(year, month - 1, day);
}

export function unifyTimestampDate(a: Timestamp | Date): Date {
    if (a instanceof Timestamp) {
        return new Date(a.toMillis());
    } else {
        return a;
    }
}
