import {Status} from "@inquirer/core";
import colors from "yoctocolors-cjs";


export const prepareValue = (value: string, status: Status): string => {
    switch(status) {
        case "selected":
            return colors.green(value);

        case "active":
            return colors.blue(value);

        case "done":
            return colors.cyan(value);

        default:
            return value;
    }
};
