import { DatePipe } from "@angular/common";
import { Timestamp } from "@angular/fire/firestore";

class CDate {
    datePipe: DatePipe = new DatePipe(navigator.language);
    constructor(public dt: Date) {}
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

export function dateRangeHumanizer(start: Timestamp, end: Timestamp): string {
    const startDT = new Date(start.toMillis());
    const endDT = new Date(end.toMillis());

    const cStartDT = new CDate(startDT);
    const cEndDT = new CDate(endDT);

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
    returnString += cStartDT.transform("HH:MM - ");
    returnString += cEndDT.transform("HH:MM");

    return returnString;
}
