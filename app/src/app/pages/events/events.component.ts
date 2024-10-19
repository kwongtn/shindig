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
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzSwitchModule } from "ng-zorro-antd/switch";

import { CommonModule, DOCUMENT } from "@angular/common";
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
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    where,
} from "@angular/fire/firestore";
import { FormGroup, FormsModule } from "@angular/forms";

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
        NzSpinModule,
        NzSwitchModule,
    ],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent implements OnInit, OnDestroy {
    private firestore = inject(Firestore);
    events: IEvent[] = [];
    oriEvents: IEvent[] = [];

    currInputText = "";
    showUnapproved = false;

    isLoading: boolean = true;
    eventCollectionRef = collection(this.firestore, "events");
    isSmallScreen: boolean = false;

    drawerRef: NzDrawerRef<EventFormComponent, DrawerReturnData> | undefined =
        undefined;
    @ViewChild("drawerFooter") drawerFooter!: TemplateRef<any>;

    width: string = "700px";
    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.width = clientWidth < 700 ? "100vw" : "700px";
        this.isSmallScreen = clientWidth < 1240;
    }

    constructor(
        private drawerService: NzDrawerService,
        private notification: NotificationService,
        public auth: AuthService,
        @Inject(DOCUMENT) private document: Document
    ) {}

    runQuery() {
        const queryList: QueryConstraint[] = [
            where("endDatetime", ">=", new Date()),
            where("isApproved", "==", !this.showUnapproved),
        ];

        // If is not admin, show unapproved for self only
        if (!this.auth.isAdmin() && this.showUnapproved) {
            queryList.push(
                where(
                    "authorId",
                    "==",
                    doc(
                        this.firestore,
                        "users",
                        `${this.auth.userData.value?.uid}`
                    )
                )
            );
        }
        queryList.push(orderBy("startDatetime", "asc"));

        const queryRef = query(this.eventCollectionRef, ...queryList);
        getDocs(queryRef)
            .then((data) => {
                const currArray: IEvent[] = [];
                data.forEach((elem) => {
                    currArray.push({ ...(elem.data() as IEvent), id: elem.id });
                });
                this.oriEvents = currArray;
                if (this.currInputText) {
                    this.filterEvents(this.currInputText);
                } else {
                    this.events = [...this.oriEvents];
                }

                this.isLoading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    ngOnInit(): void {
        this.runQuery();
        this.resize();
    }

    ngOnDestroy(): void {}

    onShowUnapprovedChange(showUnapproved: boolean) {
        this.showUnapproved = showUnapproved;
        this.runQuery();
    }

    filterEvents(inputText: string) {
        if (inputText === "") {
            this.events = [...this.oriEvents];
            return;
        }

        const caseInsensitiveLowerCase = inputText.toLowerCase();
        this.events = this.oriEvents.filter((data) => {
            return (
                data.title.toLowerCase().indexOf(caseInsensitiveLowerCase) >
                    -1 ||
                (data.subtitle
                    ?.toLowerCase()
                    .indexOf(caseInsensitiveLowerCase) ??
                    false) ||
                data.description
                    .toLowerCase()
                    .indexOf(caseInsensitiveLowerCase) > -1
            );
        });

        this.currInputText = inputText;
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
