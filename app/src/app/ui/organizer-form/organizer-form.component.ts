import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzCodeEditorModule } from "ng-zorro-antd/code-editor";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";

import { Component, inject } from "@angular/core";
import { Firestore } from "@angular/fire/firestore";
import {
    FormGroup,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators,
} from "@angular/forms";

import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: "ui-organizer-form",
    standalone: true,
    imports: [
        NzCheckboxModule,
        NzDatePickerModule,
        NzFormModule,
        NzInputModule,
        ReactiveFormsModule,
        NzCodeEditorModule,
    ],
    templateUrl: "./organizer-form.component.html",
    styleUrl: "./organizer-form.component.less",
})
export class OrganizerFormComponent {
    private firestore = inject(Firestore);
    codeEditorOptions: editor.IStandaloneEditorConstructionOptions = {
        language: "markdown",
        lineNumbers: "off",
        lineNumbersMinChars: 0,
        folding: false,
        lineDecorationsWidth: 0,
        wordWrap: "on",
        minimap: { enabled: false },
        lineHeight: 16,
    };

    showLoading: boolean = false;
    submissionForm: FormGroup<any>;

    formProps = [
        new FormProps("Title", "title", "simpleText", { required: true }),
        new FormProps("Subtitle", "subtitle", "simpleText", false),
        new FormProps("Description", "description", "markdown", {
            required: true,
            helpText: "You can use markdown here 😎",
        }),
        new FormProps("Start Datetime", "startDatetime", "datetime", {
            required: true,
        }),
        new FormProps("End Datetime", "endDatetime", "datetime", {
            required: true,
        }),
        new FormProps("Event Links", "eventLinks", "paragraphText", {
            required: true,
            helpText: "Related links, one per row",
        }),
        // new FormProps("", "organizerIds"),
        new FormProps("Event Banner Url", "bannerUri", "simpleText"),
        // new FormProps("", "locationId"),
        // new FormProps("", "tagIds"),
        new FormProps("Walk-In Available", "isWalkInAvailable", "checkbox"),
        new FormProps("Details Confirmed", "isConfirmed", "checkbox"),
        // new FormProps("", "createdAt"),
        // new FormProps("", "updatedAt"),
    ];

    constructor(private fb: UntypedFormBuilder, private auth: AuthService) {
        this.submissionForm = this.fb.group({
            title: ["", [Validators.required]],
            subtitle: [undefined, []],
            description: ["", [Validators.required]],
            startDatetime: [undefined, [Validators.required]],
            endDatetime: [undefined, [Validators.required]],
            eventLinks: ["", [Validators.required]],
            organizerIds: [[], [Validators.required]],
            bannerUri: [undefined, []],
            locationId: [undefined, [Validators.required]],
            tagIds: [[], []],
            isWalkInAvailable: [true, []],
            isConfirmed: [false, []],
            createdAt: [new Date(), [Validators.required]],
            updatedAt: [new Date(), [Validators.required]],
        });
    }

    onSubmit(): Promise<any> {
        return Promise.resolve("");
    }
}
