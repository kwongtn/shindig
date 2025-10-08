import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCollapseModule } from "ng-zorro-antd/collapse";
import {
    NzDrawerModule,
    NzDrawerRef,
    NzDrawerService,
} from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSegmentedModule } from "ng-zorro-antd/segmented";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { Subscription } from "rxjs";

import { CommonModule, DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { doc } from "@angular/fire/firestore";
import { FormGroup, FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { EventQueries, segmentOptions } from "../../common/event-queries";
import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { EventExtractedDataType, IEvent } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";
import { EventFormComponent } from "../../ui/event-form/event-form.component";
import { SearchComponent } from "../../ui/search/search.component";

type DrawerReturnData = any;

@Component({
    selector: "app-events",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        EventCardComponent,
        SearchComponent,
        NzButtonModule,
        NzCollapseModule,
        NzDrawerModule,
        NzEmptyModule,
        NzFlexModule,
        NzGridModule,
        NzIconModule,
        NzSegmentedModule,
        NzSpinModule,
        NzSwitchModule,
    ],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent extends EventQueries implements OnInit, OnDestroy {
    private document = inject(DOCUMENT);

    isSmallScreen: boolean = false;

    authStateSubscription!: Subscription;

    drawerRef:
        | NzDrawerRef<
              EventFormComponent<EventExtractedDataType>,
              DrawerReturnData
          >
        | undefined = undefined;
    @ViewChild("drawerFooter") drawerFooter!: TemplateRef<any>;

    override baseUrlArr: string[] = ["events"];

    width: string = "700px";
    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.width = clientWidth < 700 ? "100vw" : "700px";
        this.isSmallScreen = clientWidth < 1240;

        this.displaySegmentOptions = segmentOptions.map((elem) => {
            return {
                ...(elem as any),
                label: this.isSmallScreen ? undefined : elem.label,
            };
        });
    }

    constructor(
        private drawerService: NzDrawerService,
        private notification: NotificationService,
        public override auth: AuthService,
        public override router: Router,
        public route: ActivatedRoute
    ) {
        super(auth, router);
    }

    async ngOnInit() {
        this.resize();
        this.authStateSubscription = this.auth.authState$.subscribe(() => {
            this.runQuery();
        });
    }

    ngOnDestroy(): void {
        this.authStateSubscription?.unsubscribe();
    }

    onShowUnapprovedChange(showUnapprovedOnly: boolean) {
        this.showUnapprovedOnly = showUnapprovedOnly;
        this.runQuery();
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
            nzData: {
                targetCollection: "events",
                showExtractWebpageBar: true,
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
                        tooltip: "You can use markdown here 😎",
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
                    new FormProps("Organizers", "organizerIds", {
                        firestore: this.firestore,
                        fieldType: "multiSelect",
                        collection: "organizers",
                        labelField: "name",
                    }),
                    new FormProps("Event Banner Url", "bannerUri", {
                        default: "undefined",
                    }),
                    // new FormProps("", "locationId"),
                    // new FormProps("", "tagIds", {
                    //     default: [],
                    // }),
                    new FormProps("Tags", "tagIds", {
                        firestore: this.firestore,
                        fieldType: "tagSelect",
                        collection: "tags",
                        labelField: "name",
                        default: [],
                    }),
                    new FormProps("Is Paid Event", "isPaid", {
                        fieldType: "checkbox",
                    }),
                    new FormProps("Walk-In Available", "isWalkInAvailable", {
                        fieldType: "checkbox",
                        default: true,
                    }),
                    new FormProps("Details Confirmed", "isConfirmed", {
                        fieldType: "checkbox",
                    }),
                    new FormProps("Is Approved", "isApproved", {
                        fieldType: "checkbox",
                        display: this.auth.isAdmin(),
                        default: false,
                    }),
                    new FormProps("", "createdAt", { display: false }),
                    new FormProps("", "updatedAt", { display: false }),
                ],
                submissionModifier: (data: any) => {
                    data.eventLinks = (data.eventLinks as string)
                        .trim()
                        .split("\n");
                    data.authorId = doc(
                        this.firestore,
                        "users",
                        `${this.auth.userData.value?.uid}`
                    );
                    data.organizerIds = data.organizerIds
                        ? data.organizerIds.map((id: string) => {
                              return doc(this.firestore, "organizers", id);
                          })
                        : [];
                    data.tagIds = data.tagIds
                        ? data.tagIds.map((id: string) => {
                              return doc(this.firestore, "tags", id);
                          })
                        : [];
                    data.createdAt = new Date();
                    data.updatedAt = new Date();
                    return data;
                },
                onInputChange: (
                    controlName: string,
                    data: any,
                    rootForm: FormGroup<any>
                ) => {
                    switch (controlName) {
                        case "startDatetime": {
                            console.log(data);
                            rootForm.patchValue({ endDatetime: data });
                        }
                    }
                },
                onCompleteExtract: (
                    data: EventExtractedDataType,
                    rootForm: FormGroup<any>
                ) => {
                    const patchValue: { [key: string]: any } = {
                        title: data.title,
                        description: data.description,
                        eventLinks: (data.links ?? []).join("\n"),
                        bannerUri: data.bannerUri,
                    };

                    if (data.startTime) {
                        patchValue["startDatetime"] = new Date(data.startTime);
                    }
                    if (data.endTime) {
                        patchValue["endDatetime"] = new Date(data.endTime);
                    }
                    rootForm.patchValue(patchValue, { emitEvent: false });
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

    onCardContentEdit([event, id]: [IEvent, string]) {
        console.log(event, id);
        const index = this.oriEvents.findIndex((elem) => elem.id === id);

        if (index >= 0) {
            this.oriEvents[index] = { ...event, id };
            this.filterEvents(this.currInputText);
        }
    }
}
