import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDrawerRef, NzDrawerService } from "ng-zorro-antd/drawer";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { Subscription } from "rxjs";

import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import {
    Component,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";

import { environment } from "../../../environments/environment";
import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { IEvent } from "../../types";
import {
    EventDetailsComponent,
} from "../event-details/event-details.component";
import { EventFormComponent } from "../event-form/event-form.component";

type DrawerReturnData = any;
@Component({
    selector: "ui-event-card",
    standalone: true,
    imports: [
        NgTemplateOutlet,
        NzAvatarModule,
        NzModalModule,
        NzBadgeModule,
        NzButtonModule,
        NzCardModule,
        NzDropDownModule,
        NzIconModule,
        NzToolTipModule,
    ],
    templateUrl: "./event-card.component.html",
    styleUrl: "./event-card.component.less",
})
export class EventCardComponent implements OnInit, OnDestroy {
    @Input() event!: IEvent;

    env = environment;
    authStateSubsription!: Subscription;

    extractDomain(url: string) {
        return (url.match(
            /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
        ) ?? ["", ""])[1];
    }
    drawerRef: NzDrawerRef<EventFormComponent, DrawerReturnData> | undefined =
        undefined;
    @ViewChild("drawerFooter") drawerFooter!: TemplateRef<any>;

    width: string = "700px";
    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.width = clientWidth < 700 ? "100vw" : "700px";
    }

    canEdit: boolean = false;
    constructor(
        private drawerService: NzDrawerService,
        public auth: AuthService,
        private notification: NotificationService,
        private modal: NzModalService,
        @Inject(DOCUMENT) private document: Document
    ) {}
    ngOnInit(): void {
        this.authStateSubsription = this.auth.authState$.subscribe(() => {
            // TODO: Debug why on logout the edit button does not disappear
            /**
             * On logout button to edit should disappear
             * Should also not display when user does not have permission to edit.
             *
             * Only admin and author should be able to edit.
             * Also add ReadOnly flag to freeze events
             * Events that has happened cannot be edited too.
             */
            this.canEdit =
                this.auth.userData.value?.uid === this.event.authorId.id ||
                this.auth.isAdmin();
        });
    }

    ngOnDestroy(): void {
        this.authStateSubsription?.unsubscribe();
    }

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { [key: string]: any },
            string
        >({
            nzTitle: "Edit Event Entry",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
            nzData: {
                targetCollection: "events",
                formProps: [
                    new FormProps("Event ID", "id", {
                        required: true,
                        disabled: true,
                    }),
                    new FormProps("Created", "createdAt", {
                        disabled: true,
                    }),
                    new FormProps("Last Updated", "updatedAt", {
                        disabled: true,
                    }),
                    new FormProps("Title", "title", {
                        required: true,
                    }),
                    new FormProps("Subtitle", "subtitle", {
                        required: false,
                        default: this.event.subtitle ?? "undefined",
                    }),
                    new FormProps("Description", "description", {
                        fieldType: "markdown",
                        required: true,
                        helpText: "You can use markdown here 😎",
                    }),
                    new FormProps("Start Datetime", "startDatetime", {
                        fieldType: "datetime",
                        required: true,
                    }),
                    new FormProps("End Datetime", "endDatetime", {
                        fieldType: "datetime",
                        required: true,
                    }),
                    new FormProps("Event Links", "eventLinks", {
                        fieldType: "paragraphText",
                        required: true,
                        helpText: "Related links, one per row",
                    }),
                    // new FormProps("", "organizerIds"),
                    new FormProps("Event Banner Url", "bannerUri", {
                        default: this.event.bannerUri ?? "undefined",
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
                    }),
                    new FormProps("Details Confirmed", "isConfirmed", {
                        fieldType: "checkbox",
                    }),
                    new FormProps("Approved", "isApproved", {
                        fieldType: "checkbox",
                        disabled: !this.auth.isAdmin(),
                    }),
                ],
                formData: {
                    ...this.event,
                    eventLinks: this.event.eventLinks.join("\n"),
                    startDatetime: new Date(
                        this.event.startDatetime.seconds * 1000
                    ),
                    endDatetime: new Date(
                        this.event.endDatetime.seconds * 1000
                    ),
                    createdAt: new Date(this.event.createdAt.seconds * 1000),
                    updatedAt: new Date(this.event.updatedAt.seconds * 1000),
                },
                submissionModifier: (data: any) => {
                    if (data.eventLinks) {
                        data.eventLinks = (data.eventLinks as string)
                            .trim()
                            .split("\n");
                    }
                    data.updatedAt = new Date();
                    delete data.id;
                    return data;
                },
                onInputChange: (
                    controlName: string,
                    data: any,
                    rootForm: FormGroup<any>
                ) => {
                    if (!this.auth.isAdmin()) {
                        rootForm.patchValue({ isApproved: false });
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
                    "Event modified successfully."
                );
                drawerRef.close();
            })
            .catch((reason: any) => {
                this.notification.error("Unknown Error", reason.message);
                contentComponent.showLoading = false;
            });
    }

    onCardClick() {
        this.modal.create({
            nzTitle: this.event.title,
            nzContent: EventDetailsComponent,
            nzData: {
                content: this.event.description,
            },
            nzFooter: null,
        });
    }
}
