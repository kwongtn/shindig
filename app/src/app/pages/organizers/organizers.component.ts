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

import { DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    inject,
    Inject,
    TemplateRef,
    ViewChild,
} from "@angular/core";
import { Firestore } from "@angular/fire/firestore";

import { FormProps } from "../../form-classes";
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
export class OrganizersComponent {
    private firestore = inject(Firestore);
    organizers: IOrganizer[] = [
        {
            name: "CNCF KL",
            profilePictureUri:
                "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            subtitle:
                "Ant Design, a design language for background applications, is refined by Ant UED Team.",
            description:
                "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
            createdAt: new Date(),
            updatedAt: new Date(),
            officialPageUrls: ["1", "2", "3"],
            leaders: [],
            commitees: [],
            subscribers: [],
        },
    ];
    // isLoading: boolean = true;
    isLoading: boolean = false;
    // organizerCollectionRef = collection(this.firestore, "events");
    // organizerQueryRef = query(
    //     this.eventCollectionRef,
    //     where("endDatetime", ">=", new Date()),
    //     orderBy("startDatetime", "asc")
    // );

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
        @Inject(DOCUMENT) private document: Document
    ) {}

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
                ],
                submissionModifier: (data: any) => {
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
