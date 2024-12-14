import { NzCardModule } from "ng-zorro-antd/card";
import { NzDrawerModule } from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzSegmentedModule } from "ng-zorro-antd/segmented";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzSpaceModule } from "ng-zorro-antd/space";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { MarkdownService } from "ngx-markdown";
import { firstValueFrom, Subscription } from "rxjs";

import { DOCUMENT } from "@angular/common";
import { Component, HostListener, inject, OnInit } from "@angular/core";
import { collection, doc, getDoc, where } from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { EventQueries, segmentOptions } from "../../common/event-queries";
import { AuthService } from "../../services/auth.service";
import { IOrganizer } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";

@Component({
    selector: "app-organizer",
    standalone: true,
    imports: [
        FormsModule,
        EventCardComponent,
        NzCardModule,
        NzDrawerModule,
        NzEmptyModule,
        NzGridModule,
        NzSegmentedModule,
        NzSkeletonModule,
        NzSpaceModule,
        NzSpinModule,
    ],
    templateUrl: "./organizer.component.html",
    styleUrl: "./organizer.component.less",
})
export class OrganizerComponent extends EventQueries implements OnInit {
    protected document = inject(DOCUMENT);
    organizer!: IOrganizer;

    isSmallScreen: boolean = false;
    authStateSubscription!: Subscription;

    organizerPanelLoading = true;
    organizerCollectionRef = collection(this.firestore, "organizers");

    organizerId: string = "";
    override baseUrlArr: string[] = ["organizers"];

    renderedHtml: string = "";

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
        private markdownService: MarkdownService,
        public override auth: AuthService,
        public route: ActivatedRoute,
        public override router: Router
    ) {
        super(auth, router);
        this.baseUrlArr = this.router.url.split("/").slice(1, 3);

        let currentNavigation = this.router.getCurrentNavigation();
        if (
            currentNavigation &&
            currentNavigation.extras &&
            currentNavigation.extras.state
        ) {
            this.organizer = currentNavigation.extras.state["organizer"];
            this.organizerPanelLoading = false;
        }
    }

    async renderOrganizerDetailsHtml() {
        this.renderedHtml = await this.markdownService.parse(
            this.organizer.description
        );
    }

    async ngOnInit() {
        this.resize();
        firstValueFrom(this.route.paramMap)
            .then(async (params) => {
                this.organizerId = params.get("organizerId") ?? "";
                if (this.organizerId) {
                    this.baseQueryFilter = [
                        where(
                            "organizerIds",
                            "array-contains",
                            doc(
                                this.firestore,
                                "organizers",
                                `${this.organizerId}`
                            )
                        ),
                    ];
                } else {
                    throw new Error(
                        `Organizer ${this.organizerId} not found. Navigating back to organizer page.`
                    );
                }

                if (!this.organizer) {
                    getDoc(
                        doc(this.firestore, "organizers", this.organizerId)
                    ).then(async (val) => {
                        const data = val.data();
                        if (!data) {
                            throw new Error(
                                `Organizer ${this.organizerId} not found. Navigating back to organizer page.`
                            );
                        }

                        this.organizer = { ...(data as IOrganizer) };
                        await this.renderOrganizerDetailsHtml();

                        this.organizerPanelLoading = false;
                    });
                } else {
                    await this.renderOrganizerDetailsHtml();
                }

                // Run event selection query

                this.authStateSubscription = this.auth.authState$.subscribe(
                    () => {
                        this.runQuery();
                    }
                );
            })
            .catch((err) => {
                this.router.navigate(["organizers"]);
            });
    }
}
