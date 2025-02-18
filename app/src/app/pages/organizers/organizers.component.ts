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
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { Subscription } from "rxjs";

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
    and,
    collection,
    Firestore,
    getDocs,
    orderBy,
    query,
    QueryFilterConstraint,
    where,
} from "@angular/fire/firestore";

import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
import { IOrganizer } from "../../types";
import { EventFormComponent } from "../../ui/event-form/event-form.component";
import {
    OrganizerCardComponent,
} from "../../ui/organizer-card/organizer-card.component";
import { SearchComponent } from "../../ui/search/search.component";

type DrawerReturnData = any;
@Component({
    selector: "app-organizers",
    standalone: true,
    imports: [
        NzButtonModule,
        NzDrawerModule,
        NzEmptyModule,
        NzFlexModule,
        NzGridModule,
        NzIconModule,
        NzListModule,
        NzSpinModule,
        SearchComponent,
        OrganizerCardComponent,
    ],
    templateUrl: "./organizers.component.html",
    styleUrl: "./organizers.component.less",
})
export class OrganizersComponent implements OnInit, OnDestroy {
    private firestore = inject(Firestore);

    oriOrganizers: IOrganizer[] = [];
    organizers: IOrganizer[] = [];

    currInputText = "";
    authStateSubscription!: Subscription;

    isLoading: boolean = true;
    organizerCollectionRef = collection(this.firestore, "organizers");

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

    filterOrganizers(inputText: string) {
        if (inputText === "") {
            this.organizers = [...this.oriOrganizers];
            return;
        }

        const caseInsensitiveLowerCase = inputText.toLowerCase();
        this.organizers = this.oriOrganizers.filter((data) => {
            return (
                data.name.toLowerCase().indexOf(caseInsensitiveLowerCase) >
                    -1 ||
                (data.subtitle
                    ?.toLowerCase()
                    .indexOf(caseInsensitiveLowerCase) ?? -1) > -1
            );
        });

        this.currInputText = inputText;
    }

    runQuery() {
        this.isLoading = true;
        const queryList: QueryFilterConstraint[] = [];

        if (!this.auth.isAdmin()) {
            queryList.push(where("isApproved", "==", true));
        }

        const queryRef = query(
            this.organizerCollectionRef,
            and(...queryList),
            orderBy("name", "asc")
        );

        getDocs(queryRef)
            .then((data) => {
                const currArray: IOrganizer[] = [];
                data.forEach((elem) => {
                    currArray.push({
                        ...(elem.data() as IOrganizer),
                        id: elem.id,
                    });
                });

                this.oriOrganizers = currArray;
                if (this.currInputText) {
                    this.filterOrganizers(this.currInputText);
                } else {
                    this.organizers = [...this.oriOrganizers];
                }
                this.isLoading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    ngOnInit(): void {
        this.resize();
        this.authStateSubscription = this.auth.authState$.subscribe(() => {
            this.runQuery();
        });
    }
    
    ngOnDestroy(): void {
        this.authStateSubscription?.unsubscribe();
    }

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { [key: string]: any },
            string
        >({
            nzTitle: "Add Organizer",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
            nzMaskClosable: false,
            nzData: {
                targetCollection: "organizers",
                formProps: [
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
                        helpText: "You can use markdown here 😎",
                    }),
                    new FormProps("Is Approved", "isApproved", {
                        fieldType: "checkbox",
                        display: this.auth.isAdmin(),
                        default: false,
                    }),
                ],
                submissionModifier: (data: any) => {
                    data.createdAt = new Date();
                    data.updatedAt = new Date();
                    data.officialPageUrls = (
                        data.officialPageUrls as string
                    ).split("\n");
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
