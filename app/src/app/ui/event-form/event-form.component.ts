import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzCodeEditorModule } from "ng-zorro-antd/code-editor";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NZ_DRAWER_DATA } from "ng-zorro-antd/drawer";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";

import { Component, Inject } from "@angular/core";
import { addDoc, collection, Firestore } from "@angular/fire/firestore";
import {
    FormGroup,
    ReactiveFormsModule,
    UntypedFormBuilder,
    Validators,
} from "@angular/forms";

import { environment } from "../../../environments/environment";
import { FormProps } from "../../form-classes";
import { AuthService } from "../../services/auth.service";

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
    codeEditorOptions: editor.IStandaloneEditorConstructionOptions =
        environment.form.codeEditorOptions;

    targetCollection!: string;

    showLoading: boolean = false;
    submissionModifier: (data: any) => any = (data) => {
        return data;
    };
    onInputChange: (
        controlName: string,
        data: any,
        rootForm: FormGroup<any>
    ) => any = (data) => {};

    submissionForm: FormGroup<any>;

    formProps: FormProps[];

    constructor(
        private fb: UntypedFormBuilder,
        private auth: AuthService,
        @Inject(NZ_DRAWER_DATA) private drawerData: { [key: string]: any },
        @Inject(Firestore) private firestore: Firestore
    ) {
        this.targetCollection = this.drawerData["targetCollection"];
        this.formProps = this.drawerData["formProps"];
        this.onInputChange =
            this.drawerData["onInputChange"] ?? this.onInputChange;
        this.submissionModifier =
            this.drawerData["submissionModifier"] ?? this.submissionModifier;

        this.submissionForm = this.fb.group(
            Object.fromEntries(
                this.formProps.map((data) => {
                    const validators = [];

                    if (data.extra.required) {
                        validators.push(Validators.required);
                    }
                    return [data.controlName, [data.defaultValue, validators]];
                })
            )
        );
    }

    onSubmit(): Promise<any> {
        console.log(this.submissionForm.value);

        return addDoc(collection(this.firestore, this.targetCollection), {
            ...this.submissionModifier({...this.submissionForm.value}),
        });
    }
}
