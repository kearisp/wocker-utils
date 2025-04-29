import {PartialDeep} from "@inquirer/type";
import {Theme} from "./Theme";
import {PromptValidationConfig} from "./PromptValidationConfig";


export type PromptConfig<
    V = unknown,
    C = object,
    T extends Theme = Theme
> = C & PromptValidationConfig<V> & {
    message?: string;
    default?: V;
    theme?: PartialDeep<T>;
};
