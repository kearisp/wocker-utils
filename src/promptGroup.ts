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

export const promptGroup = async (options: Options, values: any = {}) => {
    const res: any = {};

    for(const key in options) {
        const params = options[key];

        switch(params.type) {
            case "number":
            case "int":
            case "string": {
                res[key] = await promptText({
                    ...params,
                    default: values[key] || params.default
                });
                break;
            }

            case "boolean": {
                const {type, ...rest} = params;

                res[key] = await promptConfirm({
                    ...rest,
                    default: typeof values[key] !== "undefined"
                        ? values[key] === "true"
                        : params.default as boolean
                });
                break;
            }

            case "select": {
                const {type, ...rest} = params;

                res[key] = await promptSelect({
                    ...rest,
                    default: values[key] || params.default
                });
                break;
            }
        }
    }

    return res;
};
