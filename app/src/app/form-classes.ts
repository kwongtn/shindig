import {
    collection,
    Firestore,
    getDocs,
    orderBy,
    query,
} from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";

interface IFormPropsExtra {
    required: boolean;
    display: boolean;
    fieldType:
        | "simpleText"
        | "paragraphText"
        | "markdown"
        | "datetime"
        | "checkbox"
        | "multiSelect"
        | "tagSelect";
    helpText?: string;
    tooltip?: string;
    disabled: boolean;

    // Firebase specific
    collection?: string;
}

const defaultMap: { [key: string]: any } = {
    simpleText: "",
    paragraphText: "",
    markdown: "",
    datetime: new Date(),
    checkbox: false,
};

export class FormProps {
    firestore?: Firestore;

    label: string;
    controlName: string;
    defaultValue: any;

    $isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    options: {
        label: string;
        value: any;
    }[] = [];

    extra: IFormPropsExtra = {
        fieldType: "simpleText",
        required: false,
        display: true,
        disabled: false,
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

        if (extra["firestore"]) {
            this.$isLoading.next(true);

            this.firestore = extra["firestore"] as Firestore;
            const collectionRef = collection(
                this.firestore,
                extra["collection"]
            );
            const queryRef = query(collectionRef, orderBy("name", "asc"));
            getDocs(queryRef).then((data) => {
                this.options = data.docs.map((val) => {
                    return {
                        label: val.get(extra["labelField"]),
                        value: val.ref.id,
                    };
                });
                this.$isLoading.next(false);
            });
        }
    }
}
