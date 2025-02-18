import { DatePipe, isPlatformBrowser } from "@angular/common";
import { Inject, Pipe, PipeTransform, PLATFORM_ID } from "@angular/core";
import { Timestamp } from "@angular/fire/firestore";

class CDate {
    constructor(public dt: Date, private datePipe: DatePipe) {}

    transform(fmt: string) {
        return this.datePipe.transform(this.dt, fmt);
    }
    get day() {
        return this.datePipe.transform(this.dt, "dd");
    }
    get month() {
        return this.datePipe.transform(this.dt, "MM");
    }
    get year() {
        return this.datePipe.transform(this.dt, "YYYY");
    }
}

@Pipe({
    name: "dateRangeHumanizer",
})
export class DateRangeHumanizerPipe implements PipeTransform {
    locale!: string;
    datePipe!: DatePipe;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.locale =
            isPlatformBrowser(this.platformId) &&
            navigator &&
            navigator.language
                ? navigator.language
                : "en-US";

        this.datePipe = new DatePipe(this.locale);
    }

    transform(dates: [Timestamp, Timestamp], ...args: unknown[]): string {
        const startDT = new Date(dates[0].toMillis());
        const endDT = new Date(dates[1].toMillis());

        const cStartDT = new CDate(startDT, this.datePipe);
        const cEndDT = new CDate(endDT, this.datePipe);

        let returnString: string = `${cStartDT.transform("E")}`;
        if (cStartDT.year === cEndDT.year) {
            if (cStartDT.month === cEndDT.month) {
                if (cStartDT.day === cEndDT.day) {
                    returnString += cStartDT.transform(", yyyy MMM");
                } else {
                    returnString += cEndDT.transform(" - E, ");
                    returnString += cStartDT.transform("yyyy MMM dd -");
                }
            } else {
                returnString += cEndDT.transform(" - E, ");

                returnString += cStartDT.transform("yyyy MMM dd - ");
                returnString += cEndDT.transform("MMM");
            }
        } else {
            returnString += cEndDT.transform(" - E, ");

            returnString += cStartDT.transform("yyyy MMM dd - ");
            returnString += cEndDT.transform("yyyy MMM");
        }
        returnString += cEndDT.transform(" dd | ");
        returnString += cStartDT.transform("HH:mm - ");
        returnString += cEndDT.transform("HH:mm");

        return returnString;
    }
}
