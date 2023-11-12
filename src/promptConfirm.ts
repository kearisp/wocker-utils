import inquirer from "inquirer";


type Options = {
    message?: string;
    default?: boolean;
};

export const promptConfirm = async (options: Options): Promise<boolean> => {
    const {
        message,
        default: defaultValue = true
    } = options;

    const {confirm} = await inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message,
        default: defaultValue
    });

    return confirm;
};

export {Options as PromptConfirmOptions};
