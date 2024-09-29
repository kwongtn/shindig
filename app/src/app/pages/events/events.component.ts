import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";

import { Component } from "@angular/core";

import { IEvent } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";
import { SearchComponent } from "../../ui/search/search.component";

@Component({
    selector: "app-events",
    standalone: true,
    imports: [EventCardComponent, SearchComponent, NzGridModule, NzIconModule],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent {
    events: IEvent[] = [
        {
            startDatetime: new Date("2024-10-24 18:00:00"),
            eventLink: "https://www.google.com",
            organizerIds: [],
            bannerUri: "https://secure.meetupstatic.com/photos/event/7/a/9/4/600_523651380.webp",
            locationId: "",
            title: "Bring your Infrastructure to Cloud",
            subtitle: "AWS Cloud Club at Asia Pacific University",
            description: "Description",
            tagIds: [],
            isPublic: true,
            isUnconfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            locationId: "",
            title: "Title1",
            subtitle: "Subtitle1",
            description: "Description1",
            tagIds: [],
            isPublic: true,
            isUnconfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            bannerUri: "https://secure.meetupstatic.com/photos/event/2/1/1/4/600_511088468.webp?w=384",
            locationId: "",
            title: "Title2",
            subtitle: "Subtitle2",
            description: "Description2",
            tagIds: [],
            isPublic: false,
            isUnconfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            bannerUri: "https://secure.meetupstatic.com/photos/event/d/e/c/2/600_518457026.webp?w=384",
            locationId: "",
            title: "Title3",
            subtitle: "Subtitle3",
            description: "Description3",
            tagIds: [],
            isPublic: false,
            isUnconfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            bannerUri: "https://secure.meetupstatic.com/photos/event/d/e/c/2/600_518457026.webp?w=384",
            locationId: "",
            title: "Title4",
            subtitle: "Subtitle4",
            description: "Description4",
            tagIds: [],
            isPublic: true,
            isUnconfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    constructor(){

    }
}
