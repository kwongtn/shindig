import { Component } from "@angular/core";
import { environment } from "../../../environments/environment";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";

@Component({
    selector: "ui-copy-calendar-url-button",
    standalone: true,
    imports: [NzDropDownModule, NzButtonModule, NzIconModule],
    templateUrl: "./copy-calendar-url-button.component.html",
    styleUrl: "./copy-calendar-url-button.component.less",
})
export class CopyCalendarUrlButtonComponent {
    showCheckmark = false;

    calendarTypes = [
        {
            label: "Google",
            href: "https://calendar.google.com/calendar/r/settings/addbyurl",
        },
        {
            label: "Outlook",
            href: "https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379#ID0EDFBD",
        },
        {
            label: "Apple",
            href: "https://support.apple.com/en-us/102301",
        },
        {
            label: "iCal",
            href: environment.calendar.publicUrl,
        },
    ];

    copyToCalendar() {
        navigator.clipboard.writeText(environment.calendar.publicUrl);
        this.showCheckmark = true;
    }
}
