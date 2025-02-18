import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDrawerRef, NzDrawerService } from "ng-zorro-antd/drawer";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { Subscription } from "rxjs";

import { CommonModule, DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    inject,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { FormProps } from "../../form-classes";
import { ExtractDomainPipe } from "../../pipes/extract-domain.pipe";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { IOrganizer } from "../../types";
import { EventFormComponent } from "../event-form/event-form.component";

type DrawerReturnData = any;
@Component({
    selector: "ui-organizer-card",
    standalone: true,
    imports: [
        CommonModule,
        NzAvatarModule,
        NzButtonModule,
        NzCardModule,
        NzDropDownModule,
        NzIconModule,
        NzModalModule,
        NzToolTipModule,
        ExtractDomainPipe,
    ],
    templateUrl: "./organizer-card.component.html",
    styleUrl: "./organizer-card.component.less",
})
export class OrganizerCardComponent implements OnInit {
    private firestore = inject(Firestore);
    private document = inject(DOCUMENT);

    @Input() organizer!: IOrganizer;

    authStateSubsription!: Subscription;

    constructor(
        public auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private drawerService: NzDrawerService,
        private notification: NotificationService,
        private modal: NzModalService
    ) {}

    canEdit: boolean = false;
    ngOnInit() {
        this.authStateSubsription = this.auth.authState$.subscribe(() => {
            /**
             * On logout button to edit should disappear
             * Only admin should be able to edit.
             */
            this.canEdit = this.auth.isAdmin();
        });
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

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { [key: string]: any },
            string
        >({
            nzTitle: "Edit Organizer Entry",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
            nzData: {
                targetCollection: "organizers",
                formProps: [
                    new FormProps("Organizer ID", "id", {
                        required: true,
                        disabled: true,
                    }),
                    new FormProps("Created", "createdAt", {
                        disabled: true,
                    }),
                    new FormProps("Last Updated", "updatedAt", {
                        disabled: true,
                    }),
                    new FormProps("Name", "name", {
                        required: true,
                    }),

                    new FormProps("Subtitle", "subtitle", {
                        required: false,
                        default: "undefined",
                    }),
                    new FormProps("Profile Picture URI", "profilePictureUri", {
                        required: false,
                        default: "undefined",
                    }),
                    new FormProps("Banner URI", "bannerUri", {
                        required: false,
                        default: "undefined",
                    }),
                    new FormProps("Page Links", "officialPageUrls", {
                        fieldType: "paragraphText",
                        required: true,
                        helpText: "Related links, one per row",
                    }),

                    new FormProps("Description", "description", {
                        fieldType: "markdown",
                        required: true,
                        tooltip: "You can use markdown here 😎",
                    }),
                    new FormProps("Approved", "isApproved", {
                        fieldType: "checkbox",
                        disabled: !this.auth.isAdmin(),
                    }),
                ],
                formData: {
                    ...this.organizer,
                },
                submissionModifier: (data: any) => {
                    data.createdAt = data.createdAt ?? new Date();
                    data.updatedAt = new Date();
                    data.officialPageUrls = (
                        data.officialPageUrls as string
                    ).split("\n");
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
                    "Organizer modified successfully."
                );
                drawerRef.close();
            })
            .catch((reason: any) => {
                this.notification.error("Unknown Error", reason.message);
                contentComponent.showLoading = false;
            });
    }

    onCardClick() {
        this.router.navigate([this.organizer.id, "upcoming", 1], {
            relativeTo: this.route,
            state: {
                // We pass the organizer here to reduce the need to re-query
                organizer: this.organizer,
            },
        });
    }
}
