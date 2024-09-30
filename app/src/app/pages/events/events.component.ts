import { NzButtonModule } from "ng-zorro-antd/button";
import {
    NzDrawerModule,
    NzDrawerRef,
    NzDrawerService,
} from "ng-zorro-antd/drawer";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";

import { DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    Inject,
    TemplateRef,
    ViewChild,
} from "@angular/core";

import { NotificationService } from "../../services/notification.service";
import { IEvent } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";
import { EventFormComponent } from "../../ui/event-form/event-form.component";
import { SearchComponent } from "../../ui/search/search.component";

type DrawerReturnData = any;

@Component({
    selector: "app-events",
    standalone: true,
    imports: [
        EventCardComponent,
        SearchComponent,
        NzButtonModule,
        NzDrawerModule,
        NzFlexModule,
        NzGridModule,
        NzIconModule,
    ],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent {
    events: IEvent[] = [
        {
            startDatetime: new Date("2024-10-24 18:00:00"),
            eventLink: "https://www.google.com",
            organizerIds: [],
            bannerUri:
                "https://secure.meetupstatic.com/photos/event/7/a/9/4/600_523651380.webp",
            locationId: "",
            title: "Bring your Infrastructure to Cloud",
            subtitle: "AWS Cloud Club at Asia Pacific University",
            description: "Description",
            tagIds: [],
            isWalkInAvailable: true,
            isConfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink:
                "https://www.meetup.com/hackingthursday/events/303408354/",
            organizerIds: [],
            locationId: "",
            title: "Week meetup Tamsui 固定聚會 淡水",
            subtitle: "HackingThursday 黑客星期四",
            description: "Description1",
            tagIds: [],
            isWalkInAvailable: true,
            isConfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink:
                "https://www.meetup.com/hackingthursday/events/303408354/",
            organizerIds: [],
            bannerUri:
                "https://secure.meetupstatic.com/photos/event/2/1/1/4/600_511088468.webp?w=384",
            locationId: "",
            title: "Title2",
            subtitle: "Subtitle2",
            description: "Description2",
            tagIds: [],
            isWalkInAvailable: false,
            isConfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            bannerUri:
                "https://secure.meetupstatic.com/photos/event/d/e/c/2/600_518457026.webp?w=384",
            locationId: "",
            title: "Title3",
            subtitle: "Subtitle3",
            description: "Description3",
            tagIds: [],
            isWalkInAvailable: false,
            isConfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            startDatetime: new Date(),
            eventLink: "www.google.com",
            organizerIds: [],
            bannerUri:
                "https://secure.meetupstatic.com/photos/event/d/e/c/2/600_518457026.webp?w=384",
            locationId: "",
            title: "Title4",
            subtitle: "Subtitle4",
            description: "Description4",
            tagIds: [],
            isWalkInAvailable: true,
            isConfirmed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    drawerRef: NzDrawerRef<EventFormComponent, DrawerReturnData> | undefined =
        undefined;
    @ViewChild("drawerFooter") drawerFooter!: TemplateRef<any>;

    width: string = "700px";
    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.width = clientWidth < 700 ? "100vw" : "700px";
    }

    constructor(
        private drawerService: NzDrawerService,
        private notification: NotificationService,
        @Inject(DOCUMENT) private document: Document,
    ) {
        this.resize();
    }

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { value: string },
            string
        >({
            nzTitle: "Add Event Entry",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
        });

        this.drawerRef.afterOpen.subscribe(() => {
            console.log("Drawer(Component) open");
        });

        this.drawerRef.afterClose.subscribe((data) => {
            console.log(data);
        });
    }

    close() {
        this.drawerRef?.close();
    }

    submit() {
        const drawerRef = this.drawerRef;
        if (!drawerRef) return;

        const contentComponent = drawerRef.getContentComponent();
        if (!contentComponent) return;

        contentComponent.showLoading = true;
        contentComponent
            .onSubmit()
            ?.then((res) => {
                contentComponent.showLoading = false;
                drawerRef.close();
            })
            .catch((reason: any) => {
                this.notification.error("Unknown Error", reason.message);
                contentComponent.showLoading = false;
            });
    }
}
