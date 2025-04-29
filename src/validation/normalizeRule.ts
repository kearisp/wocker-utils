import {ValidationRule} from "../types/ValidationRule";
import {ValidationValue} from "../types/ValidationValue";


export const normalizeRule = <T extends ValidationValue = ValidationValue>(
    rule?: ValidationRule<T>
): [T | undefined, string | undefined] => {
    if(typeof rule === "undefined") {
        return [undefined, undefined];
    }

    if(typeof rule === "object" && rule !== null && !(rule instanceof RegExp)) {
        return [rule.value, rule.message];
    }

    return [
        rule as Exclude<T, ValidationRule<T>>,
        undefined
    ];
};
