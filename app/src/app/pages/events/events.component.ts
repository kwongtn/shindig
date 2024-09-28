import { Component } from "@angular/core";

import { SearchComponent } from "../../ui/search/search.component";

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [SearchComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.less'
})
export class EventsComponent {

}
