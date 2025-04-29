import {describe, it, expect} from "@jest/globals";
import {normalizeOptions, RawOptions} from "./normalizeOptions";


describe("normalizeOptions", () => {
    it("should normalize an array of strings", () => {
        const input: RawOptions = ["Option1", "Option2", "Option3"];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Option1", value: "Option1"},
            {label: "Option2", value: "Option2"},
            {label: "Option3", value: "Option3"}
        ]);
    });

    it("should normalize an object with key-value pairs", () => {
        const input: RawOptions = {
            "value1": "Label 1",
            "value2": "Label 2",
            "value3": "Label 3"
        };

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Label 1", value: "value1"},
            {label: "Label 2", value: "value2"},
            {label: "Label 3", value: "value3"}
        ]);
    });

    it("should normalize an array of objects with label and value", () => {
        const input: RawOptions = [
            {label: "Label 1", value: "value1"},
            {label: "Label 2", value: "value2"},
            {label: "Label 3", value: "value3"}
        ];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Label 1", value: "value1"},
            {label: "Label 2", value: "value2"},
            {label: "Label 3", value: "value3"}
        ]);
    });

    it("should normalize an array of objects with only value property", () => {
        const input: RawOptions = [
            {value: "value1"},
            {value: "value2"},
            {value: "value3"}
        ];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "value1", value: "value1"},
            {label: "value2", value: "value2"},
            {label: "value3", value: "value3"}
        ]);
    });

    it("should normalize a mixed array of strings and objects", () => {
        const input: RawOptions = [
            "Option1",
            {label: "Label 2", value: "value2"},
            {value: "value3"}
        ];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Option1", value: "Option1"},
            {label: "Label 2", value: "value2"},
            {label: "value3", value: "value3"}
        ]);
    });

    it("should handle objects with empty or missing values", () => {
        const input: RawOptions = [
            {label: "Label 1", value: ""},
            {label: "", value: "value2"},
            {label: "", value: ""},
            {}
        ];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Label 1", value: ""},
            {label: "value2", value: "value2"},
            {label: "", value: ""},
            {label: "", value: ""}
        ]);
    });

    it("should return empty array when input is empty array", () => {
        const input: RawOptions = [];

        const result = normalizeOptions(input);

        expect(result).toEqual([]);
    });

    it("should return empty array when input is empty object", () => {
        const input: RawOptions = {};

        const result = normalizeOptions(input);

        expect(result).toEqual([]);
    });

    it("should handle special characters and Unicode properly", () => {
        const input: RawOptions = [
            "Option with spaces",
            "Опція українською",
            "Option with symbols: @#$%",
            {label: "emoji 😊", value: "emoji"}
        ];

        const result = normalizeOptions(input);

        expect(result).toEqual([
            {label: "Option with spaces", value: "Option with spaces"},
            {label: "Опція українською", value: "Опція українською"},
            {label: "Option with symbols: @#$%", value: "Option with symbols: @#$%"},
            {label: "emoji 😊", value: "emoji"}
        ]);
    });
});
