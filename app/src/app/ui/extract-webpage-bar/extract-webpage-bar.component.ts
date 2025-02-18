import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { Component, EventEmitter, inject, Output } from "@angular/core";
import { Functions, httpsCallable } from "@angular/fire/functions";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "ui-extract-webpage-bar",
    standalone: true,
    imports: [
        NzAlertModule,
        NzButtonModule,
        NzInputModule,
        NzSpinModule,
        FormsModule,
    ],
    templateUrl: "./extract-webpage-bar.component.html",
    styleUrl: "./extract-webpage-bar.component.less",
})
export class ExtractWebpageBarComponent {
    private functions = inject(Functions);

    @Output() onExtract = new EventEmitter<object>();

    url: string = "";
    isLoading: boolean = false;

    runExtract() {
        this.isLoading = true;

        const scrapeWebpage = httpsCallable(this.functions, "scrapeWebpage");
        scrapeWebpage({ url: this.url })
            .then((result) => {
                console.log(result.data);
                this.onExtract.emit(result.data as object);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
}
