import inquirer from "inquirer";

import {normalizeOptions, RawOptions} from "./normalizeOptions";


type Options = {
    message?: string;
    options: RawOptions;
} & ({
    multiple?: false;
    default?: string;
} | {
    multiple: true;
    default?: string[];
});

type ResultType<T extends Options> = T['multiple'] extends true ? string[] : string;

export const promptSelect = async <R extends ResultType<T>, T extends Options = any>(props: T): Promise<R> => {
    const {
        message,
        options: rawOptions,
    } = props;

    const options = normalizeOptions(rawOptions);

    if(props.multiple) {
        const {value} = await inquirer.prompt({
            message,
            name: "value",
            type: "checkbox",
            choices: options.map((option) => {
                return {
                    name: option.label,
                    value: option.value,
                    checked: Array.isArray(props.default)
                        ? props.default.includes(option.value)
                        : false
                };
            })
        });

        return value as R;
    }

    const defaultOption = options.find((option) => {
        return option.value === props.default;
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
        return selected.value as R;
    }

    return "" as R;
};


export {Options as PromptSelectOptions}
