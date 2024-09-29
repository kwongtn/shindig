import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzIconModule } from "ng-zorro-antd/icon";

import { Component, Input } from "@angular/core";

import { IEvent } from "../../types";

@Component({
    selector: "ui-event-card",
    standalone: true,
    imports: [NzAvatarModule, NzCardModule, NzIconModule],
    templateUrl: "./event-card.component.html",
    styleUrl: "./event-card.component.less",
})
export class EventCardComponent {
    @Input() event!: IEvent;
}
