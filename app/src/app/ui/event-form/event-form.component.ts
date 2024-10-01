import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzCodeEditorModule } from "ng-zorro-antd/code-editor";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";

import { Component, inject } from "@angular/core";
import { addDoc, collection, doc, Firestore } from "@angular/fire/firestore";
import {
    FormGroup,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators,
} from "@angular/forms";

import { AuthService } from "../../services/auth.service";

class FormProps {
    label: string;
    controlName: string;
    fieldType: string;
    extra: { [key: string]: any } = { required: false };

    constructor(
        label = "",
        controlName = "",
        fieldType = "simpleText",
        extra = {}
    ) {
        this.label = label;
        this.controlName = controlName;
        this.fieldType = fieldType;
        this.extra = {
            ...this.extra,
            ...extra,
        };
    }
}

@Component({
    selector: "ui-event-form",
    standalone: true,
    imports: [
        NzCheckboxModule,
        NzDatePickerModule,
        NzFormModule,
        NzInputModule,
        ReactiveFormsModule,
        NzCodeEditorModule,
    ],
    templateUrl: "./event-form.component.html",
    styleUrl: "./event-form.component.less",
})
export class EventFormComponent {
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
        new FormProps("Event Link", "eventLink", "simpleText", {
            required: true,
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
            eventLink: ["", [Validators.required]],
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
        console.log(this.submissionForm.value);

        return addDoc(collection(this.firestore, "events"), {
            ...this.submissionForm.value,
            authorId: doc(
                this.firestore,
                "users",
                `${this.auth.userData.value?.uid}`
            ),
        });
    }
}
