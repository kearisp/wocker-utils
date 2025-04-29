import {normalizeRule} from "./normalizeRule";
import {PromptValidationConfig} from "../types/PromptValidationConfig";
import {Validation} from "../types/Validation";
import {ValidationError} from "../types/ValidationError";
import {messages} from "../messages";


export const validatePrompt = async <T = unknown>(
    value: any,
    config: PromptValidationConfig<T>
): Promise<undefined | ValidationError> => {
    const {
        required,
        min,
        max,
        minLength,
        maxLength,
        validate
    } = config;

    const isEmpty =
        typeof value === "undefined" ||
        (typeof value === "boolean" && !value) ||
        (typeof value === "string" && value === "") ||
        (typeof value === "object" && value === null) ||
        (typeof value === "number" && isNaN(value)) ||
        (Array.isArray(value) && value.length === 0);

    const isRequired =
        (typeof required === "boolean" && required) ||
        typeof required === "string";

    if(isRequired && isEmpty) {
        return {
            type: "required",
            message: typeof required === "string" ? required : messages.required
        };
    }

    const [minValue, minMessage] = normalizeRule(min);

    if(!isEmpty && typeof minValue !== "undefined") {
        if(typeof value === "number" && value < minValue) {
            return {
                type: "min",
                message: minMessage || messages.min(minValue)
            };
        }
    }

    const [maxValue, maxMessage] = normalizeRule(max);

    if(!isEmpty && typeof maxValue !== "undefined") {
        if(typeof value === "number" && value > maxValue) {
            return {
                type: "max",
                message: maxMessage || messages.max(maxValue)
            };
        }
    }

    const [minLengthValue, minLengthMessage] = normalizeRule(minLength);

    if(!isEmpty && typeof minLengthValue !== "undefined") {
        const validateValue = typeof value === "number"
            ? value.toString()
            : value;

        if(typeof validateValue === "string" && validateValue.length < minLengthValue) {
            return {
                type: "minLength",
                message: minLengthMessage || messages.minLength(minLengthValue)
            };
        }

        if(Array.isArray(value) && (value as any[]).length < minLengthValue) {
            return {
                type: "minLength",
                message: minLengthMessage || messages.minArrayLength(minLengthValue)
            };
        }
    }

    const [
        maxLengthValue,
        maxLengthMessage = ""
    ] = normalizeRule(maxLength);

    if(!isEmpty && typeof maxLengthValue === "number") {
        const validateValue = typeof value === "number"
            ? value.toString()
            : value;

        if(typeof validateValue === "string" && validateValue.length > maxLengthValue) {
            return {
                type: "maxLength",
                message: maxLengthMessage || messages.maxLength(maxLengthValue)
            };
        }

        if(Array.isArray(value) && (value as any[]).length > maxLengthValue) {
            return {
                type: "maxLength",
                message: maxLengthMessage || messages.maxArrayLength(maxLengthValue)
            };
        }
    }

    if(validate) {
        const rules: Record<string, Validation<any>> = typeof validate === "function"
            ? {validate}
            : validate;

        for(const name in rules) {
            const result = await rules[name](value);

            if(result === false || typeof result === "string") {
                return {
                    message: typeof result === "string" ? result : messages.custom,
                    type: "custom"
                };
            }
        }
    }

    return undefined;
};
