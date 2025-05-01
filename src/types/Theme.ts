import {
    Theme as InquirerTheme,
    Status
} from "@inquirer/core";


export type Theme<T extends object = object> = InquirerTheme<T & {
    style: {
        message: (message: string, status: Status, ending?: string) => string;
        value: (value: string, status: Status) => string;
    };
}>;
