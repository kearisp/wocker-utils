import {describe, it, expect} from "@jest/globals";
import {normalizeRule} from "./normalizeRule";
import {ValidationValue} from "../types/ValidationValue";
import {ValidationValueMessage} from "../types/ValidationValueMessage";


describe("normalizeRule", () => {
    it.each<[ValidationValue]>([
        [undefined as unknown as ValidationValue],
        [null as unknown as ValidationValue],
        [true],
        [1],
        ["eet"]
    ])("should return value", (rule) => {
        const [value, message] = normalizeRule(rule);

        expect(value).toEqual(rule);
        expect(message).toBeUndefined();
    });

    it.each<[ValidationValueMessage]>([
        [{message: "Test boolean", value: true}],
        [{message: "Test number", value: 1}],
        [{message: "Test string", value: "value"}]
    ])("should normalize validation value with message", (rule) => {
        const [value, message] = normalizeRule(rule);

        expect(rule.message).toEqual(message);
        expect(rule.value).toEqual(value);
    });
});
