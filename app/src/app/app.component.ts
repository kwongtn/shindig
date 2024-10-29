import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzNotificationModule } from "ng-zorro-antd/notification";

import { CommonModule, DOCUMENT } from "@angular/common";
import { Component, HostListener, Inject, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

import { AuthService } from "./services/auth.service";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterOutlet,
        NzAvatarModule,
        NzBreadCrumbModule,
        NzButtonModule,
        NzIconModule,
        NzLayoutModule,
        NzMenuModule,
        NzNotificationModule,
    ],
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit {
    headerMap = [
        {
            title: "Organizers",
            href: "/organizers",
            icon: "team",
        },
        {
            title: "Events",
            href: "/events",
            icon: "calendar",
        },
    ];
    isSmallScreen: boolean = false;

    constructor(
        public authService: AuthService,
        @Inject(DOCUMENT) private document: Document
    ) {}

    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.isSmallScreen = clientWidth < 1240;
    }

    ngOnInit(): void {
        this.resize();
    }
}
