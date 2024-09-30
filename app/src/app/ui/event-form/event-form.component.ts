import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
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
    required: boolean;
    defaultValue: any;

    constructor(
        label = "",
        controlName = "",
        fieldType = "simpleText",
        required = false,
        defaultValue = undefined
    ) {
        this.label = label;
        this.controlName = controlName;
        this.fieldType = fieldType;
        this.required = required;
        this.defaultValue = defaultValue;
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
    ],
    templateUrl: "./event-form.component.html",
    styleUrl: "./event-form.component.less",
})
export class EventFormComponent {
    private firestore = inject(Firestore);

    showLoading: boolean = false;

    submissionForm: FormGroup<any>;

    formProps = [
        new FormProps("Title", "title", "simpleText", true),
        new FormProps("Subtitle", "subtitle", "simpleText", false),
        new FormProps("Description", "description", "paragraphText", true),
        new FormProps("Start Datetime", "startDatetime", "datetime", true),
        new FormProps("End Datetime", "endDatetime", "datetime", true),
        new FormProps("Event Link", "eventLink", "simpleText", true),
        // new FormProps("", "organizerIds"),
        new FormProps("Event Banner Url", "bannerUri", "simpleText", true),
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
