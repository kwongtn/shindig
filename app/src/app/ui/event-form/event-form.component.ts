import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzCodeEditorModule } from "ng-zorro-antd/code-editor";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NZ_DRAWER_DATA } from "ng-zorro-antd/drawer";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSelectModule } from "ng-zorro-antd/select";

import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import {
    addDoc,
    collection,
    doc,
    Firestore,
    updateDoc,
} from "@angular/fire/firestore";
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
        CommonModule,
        NzCheckboxModule,
        NzDatePickerModule,
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        ReactiveFormsModule,
        NzCodeEditorModule,
    ],
    templateUrl: "./event-form.component.html",
    styleUrl: "./event-form.component.less",
})
export class EventFormComponent implements OnInit {
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

                    let dataProps = data.defaultValue;
                    if (data.extra.disabled) {
                        dataProps = {
                            value: data.defaultValue,
                            disabled: true,
                        };
                    }
                    return [data.controlName, [dataProps, validators]];
                })
            )
        );
    }

    ngOnInit() {
        if (this.drawerData["formData"]) {
            this.submissionForm.patchValue(this.drawerData["formData"], {
                emitEvent: false,
            });
            this.submissionForm.markAsPristine();
        }

        console.log(this.submissionForm);
    }

    onSubmit(): Promise<any> {
        console.log(this.submissionForm.value);

        if (this.drawerData["formData"]) {
            // Get changed data
            const changedData: { [key: string]: any } = {};
            Object.entries(this.submissionForm.controls).map(([key, ctrl]) => {
                changedData[key] = ctrl.value;
            });

            return updateDoc(
                doc(
                    this.firestore,
                    this.targetCollection,
                    this.drawerData["formData"].id
                ),
                { ...this.submissionModifier({ ...changedData }) }
            );
        } else {
            return addDoc(collection(this.firestore, this.targetCollection), {
                ...this.submissionModifier({ ...this.submissionForm.value }),
            });
        }
    }

    getFormData() {
        return {
            ...this.submissionModifier({
                ...this.submissionForm.value,
                id: this.drawerData["formData"]?.id,
            }),
        };
    }
}
