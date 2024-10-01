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
import { NzSpinModule } from "ng-zorro-antd/spin";

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
    collection,
    Firestore,
    onSnapshot,
    query,
    Unsubscribe,
    where,
} from "@angular/fire/firestore";

import { NotificationService } from "../../services/notification.service";
import { IEvent } from "../../types";
import { EventCardComponent } from "../../ui/event-card/event-card.component";
import { EventFormComponent } from "../../ui/event-form/event-form.component";
import { SearchComponent } from "../../ui/search/search.component";

type DrawerReturnData = any;

@Component({
    selector: "app-events",
    standalone: true,
    imports: [
        EventCardComponent,
        SearchComponent,
        NzButtonModule,
        NzDrawerModule,
        NzEmptyModule,
        NzFlexModule,
        NzGridModule,
        NzIconModule,
        NzSpinModule,
    ],
    templateUrl: "./events.component.html",
    styleUrl: "./events.component.less",
})
export class EventsComponent implements OnInit, OnDestroy {
    private firestore = inject(Firestore);
    events: IEvent[] = [];

    isLoading: boolean = true;
    eventCollectionRef = collection(this.firestore, "events");
    eventQueryRef = query(
        this.eventCollectionRef,
        where("endDatetime", ">=", new Date())
    );

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

    unsubscribeEvents?: Unsubscribe;
    ngOnInit(): void {
        this.unsubscribeEvents = onSnapshot(
            this.eventQueryRef,
            (data) => {
                const currArray: IEvent[] = [];
                data.forEach((elem) => {
                    currArray.push(elem.data() as IEvent);
                });
                this.events = currArray;
                this.isLoading = false;
            },
            (err) => {
                console.error(err);
            }
        );
        this.resize();
    }

    ngOnDestroy(): void {
        this.unsubscribeEvents?.();
    }

    openDrawer() {
        this.drawerRef = this.drawerService.create<
            EventFormComponent,
            { value: string },
            string
        >({
            nzTitle: "Add Event Entry",
            nzFooter: this.drawerFooter,
            // nzExtra: "Extra",
            nzWidth: this.width,
            nzContent: EventFormComponent,
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
