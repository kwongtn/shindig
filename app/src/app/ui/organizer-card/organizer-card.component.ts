import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";

import { Component, Input } from "@angular/core";

import { ExtractDomainPipe } from "../../pipes/extract-domain.pipe";
import { IOrganizer } from "../../types";

@Component({
    selector: "ui-organizer-card",
    standalone: true,
    imports: [
      NzAvatarModule,
      NzCardModule,
      NzDropDownModule,
      NzIconModule,
      NzToolTipModule,ExtractDomainPipe],
    templateUrl: "./organizer-card.component.html",
    styleUrl: "./organizer-card.component.less",
})
export class OrganizerCardComponent {
    @Input() organizer!: IOrganizer;
}
