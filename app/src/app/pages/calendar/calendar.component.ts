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
    ],
    templateUrl: "./calendar.component.html",
    styleUrl: "./calendar.component.less",
})
export class CalendarComponent implements OnInit, OnDestroy {
    public firestore = inject(Firestore);
    private document = inject(DOCUMENT);

    selectedDate: Date = new Date();
    prevSelectedDate: Date = new Date();

    nzMode: "month" | "year" = "month";
    prevNzMode: "month" | "year" = "month";

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
            const dateParam = params.get("date");
            const splitDate = dateParam?.split("-").map(Number);

            if (splitDate && splitDate.length === 3) {
                this.selectedDate = new Date(
                    splitDate[0],
                    splitDate[1] - 1,
                    splitDate[2]
                );
                this.nzMode = "month";
            } else if (splitDate && splitDate.length === 2) {
                this.selectedDate = new Date(splitDate[0], splitDate[1] - 1);
                this.nzMode = "year";
            } else {
                this.selectedDate = getCurrentLocalDate().toDate();
                this.nzMode = "month";
            }

            this.runQuery();

            this.prevSelectedDate = this.selectedDate;
            this.prevNzMode = this.nzMode;
        });
    }

    runQuery() {
        this.showLoading = true;

        const queryList: QueryFilterConstraint[] = [];

        if (this.nzMode === "year") {
            queryList.push(
                where(
                    "startDatetime",
                    ">=",
                    new Date(this.selectedDate.getFullYear(), 0, 1)
                ),
                where(
                    "startDatetime",
                    "<",
                    new Date(this.selectedDate.getFullYear() + 1, 0, 1)
                )
            );
        } else {
            // Gets anything after 14th of last month, and before 14th of next month
            queryList.push(
                where(
                    "startDatetime",
                    ">=",
                    new Date(
                        this.selectedDate.getFullYear(),
                        this.selectedDate.getMonth(),
                        -14
                    )
                ),
                where(
                    "startDatetime",
                    "<=",
                    new Date(
                        this.selectedDate.getFullYear(),
                        this.selectedDate.getMonth() + 1,
                        14
                    )
                )
            );
        }

        getDocs(
            query(
                this.eventCollectionRef,
                and(...[...queryList, where("isApproved", "==", true)])
            )
        )
            .then((data) => {
                this.events = {};
                data.forEach((event) => {
                    const eventData = event.data() as IEvent;
                    const splitDate = eventData.startDatetime
                        .toDate()
                        .toISOString()
                        .split("T")[0]
                        .split("-")
                        .map(Number);

                    var dateString: string;
                    if (this.nzMode === "year") {
                        dateString = `${splitDate[0]}-${splitDate[1]
                            .toString()
                            .padStart(2, "0")}`;
                    } else {
                        dateString = `${splitDate[0]}-${splitDate[1]
                            .toString()
                            .padStart(2, "0")}-${splitDate[2]
                            .toString()
                            .padStart(2, "0")}`;
                    }

                    const eventDateObj = this.events[dateString];
                    if (eventDateObj) {
                        eventDateObj.push(eventData);
                    } else {
                        this.events[dateString] = [eventData];
                    }
                });
                this.showLoading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    panelChange(event: { date: Date; mode: "month" | "year" }) {
        this.selectChange(event.date);
    }

    selectChange(event: Date) {
        const dateObj = getCurrentLocalDate(event);
        var dateString: string;
        if (this.nzMode === "year") {
            dateObj.day = undefined; // Set day to undefined for year mode
            dateString = dateObj.toString();
        } else {
            dateString = dateObj.toString();
        }
        this.router
            .navigate([...this.baseUrlArr, dateString], {
                queryParamsHandling: "preserve",
            })
            .then(() => {
                if (
                    this.prevNzMode !== this.nzMode ||
                    this.prevSelectedDate.getFullYear() !==
                        event.getFullYear() ||
                    this.prevSelectedDate.getMonth() !== event.getMonth()
                ) {
                    this.runQuery();
                }
                this.prevSelectedDate = event;
                this.prevNzMode = this.nzMode;
            });
    }

    ngOnDestroy(): void {
        this.authStateSubscription?.unsubscribe();
    }
}
