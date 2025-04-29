import {ValidationRule} from "./ValidationRule";
import {Validation} from "./Validation";


export type PromptValidationConfig<V = unknown> = {
    required?: boolean | string;
    min?: ValidationRule<number>;
    max?: ValidationRule<number>;
    minLength?: ValidationRule<number>;
    maxLength?: ValidationRule<number>;
    validate?: Validation<V> | Record<string, Validation<V>>;
};
