import {
    Theme as InquirerTheme,
    Status
} from "@inquirer/core";


export type Theme<T extends object = object> = InquirerTheme<T & {
    style: {
        value: (value: string, status: Status) => string;
    }
}>;
