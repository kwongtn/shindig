import { editor } from "monaco-editor/esm/vs/editor/editor.api";

export interface IEnvironment {
    form: {
        codeEditorOptions: editor.IStandaloneEditorConstructionOptions;
    };
    currency: {
        symbol: string;
        prefix: string;
        suffix: string;
        decimalPlaces: number;
    };
    firebase: {
        useEmulators: boolean;
    };
    sentry: {
        dsn?: string;
        environment: string;
    };
}

export const CommonEnvironment = {
    form: {
        codeEditorOptions: {
            language: "markdown",
            lineNumbers: "off",
            lineNumbersMinChars: 0,
            folding: false,
            lineDecorationsWidth: 0,
            wordWrap: "on",
            minimap: { enabled: false },
            lineHeight: 16,
        } as editor.IStandaloneEditorConstructionOptions,
    },
    currency: {
        symbol: "MYR",
        prefix: "RM",
        suffix: "Ringgit",
        decimalPlaces: 2,
    },
};
