import colors from "yoctocolors-cjs";


export const prepareHelp = (message: string): string => {
    return colors.gray(message);
};
