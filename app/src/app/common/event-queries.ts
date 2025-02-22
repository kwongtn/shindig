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
    limit,
    startAfter,
    DocumentSnapshot,
    QuerySnapshot,
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

    isLoading: boolean = false;
    displaySegmentOptions = { ...segmentOptions };
    segmentSelection: number = 1;

    currInputText = "";
    showUnapprovedOnly = false;

    eventCollectionRef = collection(this.firestore, "events");
    baseUrlArr: string[] = [];

    pageSize: number = 25;

    lastDocumentSnapshot: DocumentSnapshot<IEvent> | null = null;
    hasNextPage: boolean = false;

    constructor(public auth: AuthService, public router: Router) {}

    @Input()
    set state(state: string) {
        this.onSegmentChange(
            segmentOptions.findIndex((val: NzSegmentedOption) => {
                return val.value === state;
            })
        );
    }

    runQuery() {
        if (this.isLoading) {
            return;
        }
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

        let queryRef = query(
            this.eventCollectionRef,
            and(...queryList),
            orderBy("isApproved", "asc"),
            orderBy("startDatetime", showFuture ? "asc" : "desc")
        );
        if (this.lastDocumentSnapshot) {
            queryRef = query(queryRef, startAfter(this.lastDocumentSnapshot));
        }

        getDocs(query(queryRef, limit(this.pageSize + 1)))
            .then((data: QuerySnapshot) => {
                const currArray: IEvent[] = [];
                data.forEach((elem) => {
                    currArray.push({ ...(elem.data() as IEvent), id: elem.id });
                });

                /**
                 * If returned array is more than the page size,
                 * then we have more data to fetch
                 */
                if (currArray.length > this.pageSize) {
                    this.hasNextPage = true;

                    this.lastDocumentSnapshot = data.docs[
                        currArray.length - 2
                    ] as DocumentSnapshot<IEvent>;

                    this.oriEvents = [...this.oriEvents, ...currArray].slice(
                        0,
                        -1
                    );
                } else {
                    this.hasNextPage = false;
                    this.oriEvents = [...this.oriEvents, ...currArray];
                }

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
                this.lastDocumentSnapshot = null;
                this.oriEvents = [];
                this.events = [];
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
