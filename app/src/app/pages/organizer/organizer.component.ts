import { NzCardModule } from "ng-zorro-antd/card";
import { NzDrawerModule } from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzSpaceModule } from "ng-zorro-antd/space";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { firstValueFrom } from "rxjs";

import { DOCUMENT } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { collection, doc, getDoc, where } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";

import { EventQueries } from "../../common/event-queries";
import { AuthService } from "../../services/auth.service";
import { IOrganizer } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";

@Component({
    selector: "app-organizer",
    standalone: true,
    imports: [
        EventCardComponent,
        NzCardModule,
        NzDrawerModule,
        NzEmptyModule,
        NzGridModule,
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

    organizerPanelLoading = true;
    organizerCollectionRef = collection(this.firestore, "organizers");

    constructor(
        public override auth: AuthService,
        private route: ActivatedRoute,
        public override router: Router
    ) {
        super(auth, router);

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

    ngOnInit(): void {
        firstValueFrom(this.route.paramMap)
            .then((params) => {
                const organizerId = params.get("organizerId");
                if (organizerId) {
                    this.baseQueryFilter = [
                        where(
                            "organizerIds",
                            "array-contains",
                            doc(this.firestore, "organizers", `${organizerId}`)
                        ),
                    ];
                } else {
                    throw new Error(
                        `Organizer ${organizerId} not found. Navigating back to organizer page.`
                    );
                }

                if (!this.organizer) {
                    getDoc(doc(this.firestore, "organizers", organizerId)).then(
                        (val) => {
                            const data = val.data();
                            if (!data) {
                                throw new Error(
                                    `Organizer ${organizerId} not found. Navigating back to organizer page.`
                                );
                            }

                            this.organizer = { ...(data as IOrganizer) };
                            this.organizerPanelLoading = false;
                        }
                    );
                    collection(this.firestore, "organizers");
                }

                // Run event selection query
                this.runQuery();
            })
            .catch((err) => {
                this.router.navigate(["organizers"]);
            });
    }
}
