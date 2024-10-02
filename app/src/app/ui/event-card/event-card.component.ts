import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";

import { Component, Input } from "@angular/core";

import { IEvent } from "../../types";

@Component({
    selector: "ui-event-card",
    standalone: true,
    imports: [
        NzAvatarModule,
        NzCardModule,
        NzDropDownModule,
        NzIconModule,
        NzToolTipModule,
    ],
    templateUrl: "./event-card.component.html",
    styleUrl: "./event-card.component.less",
})
export class EventCardComponent {
    @Input() event!: IEvent;

    extractDomain(url: string) {
        return (url.match(
            /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
        ) ?? ["", ""])[1];
    }
}
