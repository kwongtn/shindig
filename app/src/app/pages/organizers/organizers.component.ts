import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDrawerModule } from "ng-zorro-antd/drawer";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzFlexModule } from "ng-zorro-antd/flex";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";

import { Component } from "@angular/core";

import { IOrganizer } from "../../types";
import {
    OrganizerCardComponent,
} from "../../ui/organizer-card/organizer-card.component";
import { SearchComponent } from "../../ui/search/search.component";

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
    isLoading: boolean = true;

    openDrawer() {}

    close() {}
    submit() {}
}
