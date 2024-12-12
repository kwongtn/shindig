import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { Subscription } from "rxjs";

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ExtractDomainPipe } from "../../pipes/extract-domain.pipe";
import { AuthService } from "../../services/auth.service";
import { IOrganizer } from "../../types";

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
        NzToolTipModule,
        ExtractDomainPipe,
    ],
    templateUrl: "./organizer-card.component.html",
    styleUrl: "./organizer-card.component.less",
})
export class OrganizerCardComponent implements OnInit {
    @Input() organizer!: IOrganizer;

    authStateSubsription!: Subscription;

    constructor(
        public auth: AuthService,
        private router: Router,
        private route: ActivatedRoute
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

    openDrawer() {}

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
