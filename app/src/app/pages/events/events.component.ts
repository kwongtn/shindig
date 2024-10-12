import { NzButtonModule } from "ng-zorro-antd/button";
import {
    NzDrawerModule,
    NzDrawerRef,
    NzDrawerService,
} from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    inject,
    Inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import {
    collection,
    doc,
    Firestore,
    onSnapshot,
    orderBy,
    query,
    Unsubscribe,
    where,
} from "@angular/fire/firestore";

import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";
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
        NzEmptyModule,
        NzFlexModule,
        NzGridModule,
        NzIconModule,
        NzSpinModule,
    ],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent implements OnInit, OnDestroy {
    private firestore = inject(Firestore);
    events: IEvent[] = [];

    isLoading: boolean = true;
    eventCollectionRef = collection(this.firestore, "events");
    eventQueryRef = query(
        this.eventCollectionRef,
        where("endDatetime", ">=", new Date()),
        orderBy("startDatetime", "asc")
    );

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
        public auth: AuthService,
        @Inject(DOCUMENT) private document: Document
    ) {}

    unsubscribeEvents?: Unsubscribe;
    ngOnInit(): void {
        this.unsubscribeEvents = onSnapshot(
            this.eventQueryRef,
            (data) => {
                const currArray: IEvent[] = [];
                data.forEach((elem) => {
                    currArray.push(elem.data() as IEvent);
                });
                this.events = currArray;
                this.isLoading = false;
            },
            (err) => {
                console.error(err);
            }
        );
        this.resize();
    }

    ngOnDestroy(): void {
        this.unsubscribeEvents?.();
    }

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { [key: string]: any },
            string
        >({
            nzTitle: "Add Event Entry",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
            nzMaskClosable: false,
            nzData: {
                targetCollection: "events",
                formProps: [
                    new FormProps("Title", "title", {
                        required: true,
                    }),
                    new FormProps("Subtitle", "subtitle", {
                        required: false,
                        default: "undefined",
                    }),
                    new FormProps("Description", "description", {
                        fieldType: "markdown",
                        required: true,
                        helpText: "You can use markdown here 😎",
                    }),
                    new FormProps("Start Datetime", "startDatetime", {
                        fieldType: "datetime",
                        required: true,
                        default: "undefined",
                    }),
                    new FormProps("End Datetime", "endDatetime", {
                        fieldType: "datetime",
                        required: true,
                        default: "undefined",
                    }),
                    new FormProps("Event Links", "eventLinks", {
                        fieldType: "paragraphText",
                        required: true,
                        helpText: "Related links, one per row",
                    }),
                    // new FormProps("", "organizerIds"),
                    new FormProps("Event Banner Url", "bannerUri", {
                        default: "undefined",
                    }),
                    // new FormProps("", "locationId"),
                    // new FormProps("", "tagIds", {
                    //     default: [],
                    // }),
                    new FormProps("Walk-In Available", "isWalkInAvailable", {
                        fieldType: "checkbox",
                        default: true,
                    }),
                    new FormProps("Details Confirmed", "isConfirmed", {
                        fieldType: "checkbox",
                    }),
                    new FormProps("", "createdAt", { display: false }),
                    new FormProps("", "updatedAt", { display: false }),
                ],
                submissionModifier: (data: any) => {
                    data.eventLinks = (
                        data.eventLinks as string
                    ).split("\n");
                    data.authorId= doc(
                        this.firestore,
                        "users",
                        `${this.auth.userData.value?.uid}`
                    );
                    return data;
                },
            },
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
                this.notification.success(
                    "Success",
                    "Event added successfully."
                );
                drawerRef.close();
            })
            .catch((reason: any) => {
                this.notification.error("Unknown Error", reason.message);
                contentComponent.showLoading = false;
            });
    }
}
