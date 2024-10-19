import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { MarkdownService } from "ngx-markdown";

import { Component, Inject, OnInit } from "@angular/core";

@Component({
    selector: "app-event-details",
    standalone: true,
    imports: [],
    templateUrl: "./event-details.component.html",
    styleUrl: "./event-details.component.less",
})
export class EventDetailsComponent implements OnInit {
    renderedHtml: string = "";
    constructor(
        private markdownService: MarkdownService,
        @Inject(NZ_MODAL_DATA) private modalData: { [key: string]: any }
    ) {}

    async ngOnInit() {
        console.log(this.modalData);
        this.renderedHtml = await this.markdownService.parse(
            this.modalData["content"]
        );
    }
}
