import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";

import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "ui-extract-webpage-bar",
    standalone: true,
    imports: [NzAlertModule, NzButtonModule, NzInputModule],
    templateUrl: "./extract-webpage-bar.component.html",
    styleUrl: "./extract-webpage-bar.component.less",
})
export class ExtractWebpageBarComponent {
    @Output() onExtract = new EventEmitter<object>();

    runExtract() {}
}
