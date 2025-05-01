import {Status} from "@inquirer/core";
import colors from "yoctocolors-cjs";


export const prepareMessage = (message: string, _: Status, ending: string = ":"): string => {
    message = message.trim();

    if(!/[?:.!,;]$/.test(message)) {
        message += ending;
    }

    return colors.bold(message) + " ";
};
