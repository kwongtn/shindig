import { CommonModule, DOCUMENT } from "@angular/common";
import {
    Component,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
} from "@angular/core";
import {
    and,
    collection,
    Firestore,
    getDocs,
    query,
    QueryFilterConstraint,
    where,
} from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzBadgeModule } from "ng-zorro-antd/badge";
import { NzCalendarModule } from "ng-zorro-antd/calendar";
import { NzDrawerModule } from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { firstValueFrom, Subscription } from "rxjs";

import { NzButtonModule } from "ng-zorro-antd/button";
import { AuthService } from "../../services/auth.service";
import { IEvent } from "../../types";
import { CopyCalendarUrlButtonComponent } from "../../ui/copy-calendar-url-button/copy-calendar-url-button.component";
import { EventCardComponent } from "../../ui/event-card/event-card.component";
import { getCurrentLocalDate } from "../../utils";

@Component({
    selector: "app-calendar",
    standalone: true,
    imports: [
        CommonModule,
        CopyCalendarUrlButtonComponent,
        EventCardComponent,
        FormsModule,
        NzAlertModule,
        NzBadgeModule,
        NzCalendarModule,
        NzDrawerModule,
        NzEmptyModule,
        NzGridModule,
        NzIconModule,
        NzSpinModule,
        NzButtonModule, // Added NzButtonModule
    ],
    templateUrl: "./calendar.component.html",
    styleUrl: "./calendar.component.less",
})
export class CalendarComponent implements OnInit, OnDestroy {
    public firestore = inject(Firestore);
    private document = inject(DOCUMENT);

    selectedDate: Date = new Date();
    prevSelectedDate: Date = new Date();
    calendarMode: "month" | "year" = "month";
    monthEvents: IEvent[] = [];
    monthEventCounts: Map<number, number> = new Map();

    eventCollectionRef = collection(this.firestore, "events");

    showLoading = false;
    events: { [key: string]: IEvent[] | undefined } = {};

    authStateSubscription!: Subscription;

    baseUrlArr: string[] = ["calendar"];

    width: string = "700px";
    isSmallScreen: boolean = false;

    @HostListener("window:resize")
    resize(): void {
        const clientWidth = this.document.body.clientWidth;
        this.width = clientWidth < 700 ? "100vw" : "700px";
        this.isSmallScreen = clientWidth < 1240;
    }

    constructor(
        public auth: AuthService,
        public route: ActivatedRoute,
        public router: Router
    ) {}

    async ngOnInit() {
        this.resize();
        this.authStateSubscription = this.auth.authState$.subscribe(() => {
            this.runQuery();
        });
        firstValueFrom(this.route.paramMap).then((params) => {
            this.selectedDate = new Date(
                params.get("date") ?? getCurrentLocalDate()
            );
            this.prevSelectedDate = this.selectedDate;
        });
    }

    runQuery() {
        this.showLoading = true;

        const startOfMonth = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth(),
            1
        );
        const endOfMonth = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            0
        );

        const queryList: QueryFilterConstraint[] = [
            where("startDatetime", ">=", startOfMonth),
            where("startDatetime", "<=", endOfMonth),
            where("isApproved", "==", true),
        ];

        getDocs(query(this.eventCollectionRef, and(...queryList)))
            .then((data) => {
                this.events = {};
                this.monthEvents = []; // Clear previous month events
                data.forEach((event) => {
                    const eventData = event.data() as IEvent;
                    const dateString = eventData.startDatetime
                        .toDate()
                        .toISOString()
                        .split("T")[0];
                    const eventDateObj = this.events[dateString];
                    if (eventDateObj) {
                        eventDateObj.push(eventData);
                    } else {
                        this.events[dateString] = [eventData];
                    }
                    this.monthEvents.push(eventData); // Add to monthEvents
                });
                this.calculateMonthEventCounts(); // Calculate event counts after fetching
                this.showLoading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    calculateMonthEventCounts(): void {
        this.monthEventCounts.clear();
        this.monthEvents.forEach((event) => {
            const month = event.startDatetime.toDate().getMonth();
            this.monthEventCounts.set(
                month,
                (this.monthEventCounts.get(month) || 0) + 1
            );
        });
    }

    selectChange(event: Date) {
        this.router
            .navigate([...this.baseUrlArr, event.toISOString().split("T")[0]], {
                queryParamsHandling: "preserve",
            })
            .then(() => {
                // Only run query if month changes or if mode is year and a new year is selected
                if (
                    this.prevSelectedDate.getMonth() !== event.getMonth() ||
                    this.calendarMode === "year"
                ) {
                    this.runQuery();
                }
                this.prevSelectedDate = event;
            });
    }

    calendarModeChange(mode: "month" | "year"): void {
        this.calendarMode = mode;
        if (mode === "year") {
            // When switching to year view, automatically select the first day of the current month
            this.selectedDate = new Date(
                this.selectedDate.getFullYear(),
                this.selectedDate.getMonth(),
                1
            );
            this.runQuery(); // Fetch events for the selected month
        } else {
            // When switching to month view, ensure selectedDate is the first day of the month
            this.selectedDate = new Date(
                this.selectedDate.getFullYear(),
                this.selectedDate.getMonth(),
                1
            );
            this.runQuery(); // Fetch events for the selected month
        }
    }

    navigateCalendar(direction: number) {
        const newDate = new Date(this.selectedDate);
        if (this.calendarMode === "month") {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (this.calendarMode === "year") {
            newDate.setFullYear(newDate.getFullYear() + direction);
        }
        this.selectedDate = newDate;
        this.selectChange(this.selectedDate);
    }

    ngOnDestroy(): void {
        this.authStateSubscription?.unsubscribe();
    }
}
