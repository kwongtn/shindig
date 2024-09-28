import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";

import { Component } from "@angular/core";
import {
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ReactiveFormsModule,
} from "@angular/forms";

@Component({
    selector: "ui-search",
    standalone: true,
    imports: [ReactiveFormsModule, NzFormModule, NzButtonModule, NzInputModule],
    templateUrl: "./search.component.html",
    styleUrl: "./search.component.less",
})
export class SearchComponent {
    form: FormGroup<{
        searchText: FormControl<string>;
        includePastEvents: FormControl<boolean>;
    }>;

    constructor(private fb: NonNullableFormBuilder) {
        this.form = this.fb.group({
            searchText: [""],
            includePastEvents: [true],
        });
    }
}
