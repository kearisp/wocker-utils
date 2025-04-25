import {normalizeOptions} from "./normalizeOptions";
import {promptConfirm, PromptConfirmOptions} from "./promptConfirm";
import {promptSelect, PromptSelectOptions} from "./promptSelect";
import {promptText, PromptTextOptions} from "./promptText";


type ConfirmOptions = PromptConfirmOptions & {
    type: "boolean";
};

type SelectOptions = PromptSelectOptions & {
    type: "select";
};

type Options = {
    [key: string]: PromptTextOptions | ConfirmOptions | SelectOptions;
};

export const promptConfig = async (options: Options, values: any = {}) => {
    for(const key in options) {
        const params = options[key];

        switch(params.type) {
            case "boolean": {
                const {type, ...rest} = params;

                values[key] = await promptConfirm({
                    ...rest,
                    default: typeof values[key] === "boolean"
                        ? values[key]
                        : typeof values[key] !== "undefined"
                            ? values[key] === "true"
                            : params.default as boolean
                });
                break;
            }

            case "select": {
                if(params.multiple) {
                    const {type, multiple, ...rest} = params;

                    const options = normalizeOptions(params.options);

                    const selected = await promptSelect({
                        ...rest,
                        multiple: true,
                        default: options.map((option) => {
                            return option.value;
                        }).filter((name) => {
                            return values[name];
                        })
                    });

                    for(const option of options) {
                        if(selected.includes(option.value)) {
                            values[option.value] = true;
                        }
                        else if(option.value in values) {
                            delete values[option.value];
                        }
                    }
                }
                else {
                    const {type, multiple, ...rest} = params;

                    values[key] = await promptSelect({
                        ...rest,
                        multiple: false,
                        default: values[key] || params.default
                    });
                }
                break;
            }

            case "number":
            case "int":
            case "string":
            default: {
                values[key] = await promptText({
                    ...params,
                    default: values[key] || params.default
                })
                break;
            }
        }
    }

    return values;
};
