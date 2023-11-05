import inquirer from "inquirer";


type Options = {
    message?: string;
    options: string[] | {[value: string]: string;} | {label?: string; value: string;}[];
    default?: string;
};

export const promptSelect = async (props: Options) => {
    const {
        message,
        options: rawOptions,
        default: defaultValue
    } = props;

    const options = Array.isArray(rawOptions)
        ? rawOptions.map((option) => {
            return {
                label: typeof option === "string"
                    ? option
                    : option.label || option.value || "",
                value: typeof option === "string"
                    ? option
                    : option.value || ""
            };
        })
        : Object.keys(rawOptions).map((value) => {
            return {
                label: rawOptions[value],
                value
            };
        });

    const defaultOption = options.find((option) => {
        return option.value === defaultValue;
    });

    const {value} = await inquirer.prompt({
        choices: options.map((option) => {
            return option.label;
        }),
        message,
        name: "value",
        type: "list",
        default: defaultOption ? (defaultOption.label || defaultOption.value) : ""
    });

    const selected = options.find((option) => {
        return option.label === value;
    });

    if(selected) {
        return selected.value;
    }

    return "";
};


export {Options as PromptSelectOptions}
