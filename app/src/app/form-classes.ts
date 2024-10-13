interface IFormPropsExtra {
    required: boolean;
    display: boolean;
    fieldType:
        | "simpleText"
        | "paragraphText"
        | "markdown"
        | "datetime"
        | "checkbox";
    helpText?: string;
}

const defaultMap: { [key: string]: any } = {
    simpleText: "",
    paragraphText: "",
    markdown: "",
    datetime: new Date(),
    checkbox: false,
};

export class FormProps {
    label: string;
    controlName: string;
    defaultValue: any;
    extra: IFormPropsExtra = {
        fieldType: "simpleText",
        required: false,
        display: true,
    };

    constructor(
        label = "",
        controlName = "",
        extra: { [key: string]: any } = {}
    ) {
        this.label = label;
        this.controlName = controlName;
        this.extra = {
            ...this.extra,
            ...extra,
        };

        if (extra["default"] === "undefined") {
            this.defaultValue = undefined;
        } else {
            this.defaultValue =
                extra["default"] ?? defaultMap[extra["fieldType"]];
        }
    }
}
