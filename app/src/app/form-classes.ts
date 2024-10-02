export class FormProps {
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
