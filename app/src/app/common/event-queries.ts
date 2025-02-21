import { NzSegmentedOption } from "ng-zorro-antd/segmented";

import { Directive, inject, Input } from "@angular/core";
import {
    and,
    collection,
    doc,
    Firestore,
    getDocs,
    or,
    orderBy,
    query,
    QueryFilterConstraint,
    where,
} from "@angular/fire/firestore";
import { Router } from "@angular/router";

import { AuthService } from "../services/auth.service";
import { IEvent } from "../types";

export const segmentOptions: NzSegmentedOption[] = [
    {
        label: "Past Events",
        value: "past",
        icon: "history",
    },
    {
        label: "Upcoming Events",
        value: "upcoming",
        icon: "calendar",
    },
];

@Directive()
export class EventQueries {
    public firestore = inject(Firestore);

    events: IEvent[] = [];
    oriEvents: IEvent[] = [];

    baseQueryFilter: QueryFilterConstraint[] = [];

    isLoading: boolean = true;
    displaySegmentOptions = { ...segmentOptions };
    segmentSelection: number = 1;

    currInputText = "";
    showUnapprovedOnly = false;

    eventCollectionRef = collection(this.firestore, "events");
    baseUrlArr: string[] = [];

    constructor(public auth: AuthService, public router: Router) {}

    @Input()
    set state(state: string) {
        this.onSegmentChange(
            segmentOptions.findIndex((val: NzSegmentedOption) => {
                return val.value === state;
            })
        );
    }
    @Input()
    set page(page: number) {}

    runQuery() {
        this.isLoading = true;

        const showFuture =
            segmentOptions[this.segmentSelection].value === "upcoming";
        const queryList: QueryFilterConstraint[] = [
            ...this.baseQueryFilter,
            where("endDatetime", showFuture ? ">=" : "<=", new Date()),
        ];

        if (!this.auth.isLoggedIn()) {
            queryList.push(where("isApproved", "==", true));
        } else {
            if (!this.auth.isAdmin()) {
                /**
                 * If show all:
                 * isApproved = true +
                 * isApproved = false , author = me
                 *
                 * If show unapproved only:
                 * isApproved = false , author = me
                 */
                const orClause = [];

                if (!this.showUnapprovedOnly) {
                    orClause.push(where("isApproved", "==", true));
                }
                orClause.push(
                    and(
                        where("isApproved", "==", false),
                        where(
                            "authorId",
                            "==",
                            doc(
                                this.firestore,
                                "users",
                                `${this.auth.userData.value?.uid}`
                            )
                        )
                    )
                );

                queryList.push(or(...orClause));
            } else {
                if (this.showUnapprovedOnly) {
                    queryList.push(where("isApproved", "==", false));
                }
            }
        }

        const queryRef = query(
            this.eventCollectionRef,
            and(...queryList),
            orderBy("isApproved", "asc"),
            orderBy("startDatetime", showFuture ? "asc" : "desc")
        );
        getDocs(queryRef)
            .then((data) => {
                const currArray: IEvent[] = [];
                data.forEach((elem) => {
                    currArray.push({ ...(elem.data() as IEvent), id: elem.id });
                });
                this.oriEvents = currArray;
                if (this.currInputText) {
                    this.filterEvents(this.currInputText);
                } else {
                    this.events = [...this.oriEvents];
                }
                this.isLoading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    onSegmentChange(index: number) {
        if (index < 0) {
            return;
        }

        this.router
            .navigate([...this.baseUrlArr, segmentOptions[index].value, 1], {
                queryParamsHandling: "preserve",
            })
            .then(() => {
                this.segmentSelection = index;
                this.runQuery();
            });
    }

    filterEvents(inputText: string) {
        if (inputText === "") {
            this.events = [...this.oriEvents];
            return;
        }

        const caseInsensitiveLowerCase = inputText.toLowerCase();
        this.events = this.oriEvents.filter((data) => {
            // console.log(
            //     caseInsensitiveLowerCase,
            //     data.title,
            //     data.title.toLowerCase().indexOf(caseInsensitiveLowerCase),
            //     data.subtitle,
            //     data.subtitle
            //         ?.toLowerCase()
            //         .indexOf(caseInsensitiveLowerCase) ?? false
            // );
            return (
                data.title.toLowerCase().indexOf(caseInsensitiveLowerCase) >
                    -1 ||
                (data.subtitle
                    ?.toLowerCase()
                    .indexOf(caseInsensitiveLowerCase) ?? -1) > -1
            );
        });

        this.currInputText = inputText;
    }
}
