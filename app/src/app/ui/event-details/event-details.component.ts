import { NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { MarkdownService } from "ngx-markdown";

import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";

import { IEvent } from "../../types";

@Component({
    selector: "app-event-details",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./event-details.component.html",
    styleUrl: "./event-details.component.less",
})
export class EventDetailsComponent implements OnInit {
    renderedHtml: string = "";
    event!: IEvent;

    isMultiDayEvent!: boolean;

    constructor(
        private markdownService: MarkdownService,
        @Inject(NZ_MODAL_DATA) private modalData: { [key: string]: any }
    ) {}

    async ngOnInit() {
        console.log(this.modalData);
        this.event = this.modalData["event"];
        this.renderedHtml = await this.markdownService.parse(
            this.event.description
        );
        this.isMultiDayEvent =
            this.event.endDatetime.seconds - this.event.startDatetime.seconds >
            3600 * 24;
    }
}
