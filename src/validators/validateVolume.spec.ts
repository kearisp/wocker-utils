import {describe, it, expect} from "@jest/globals";
import {validateVolume} from "./";
import {messages} from "../messages";


describe("validateVolume", () => {
    const emptyValues = [undefined, null, ""];

    it.each(emptyValues)("should return true for empty value", (value) => {
        expect(validateVolume(value)).toBe(true);
    });

    const validValues = [
        "volume1",
        "volume_name",
        "volume-name",
        "volume123_name-456"
    ];

    it.each(validValues)("should return true for valid volume names", (value) => {
        expect(validateVolume(value)).toBe(true);
    });

    const notAStringValues = [
        123,
        {},
        [],
        Symbol("Test"),
        /^-_-$/
    ];

    it.each(notAStringValues)("should return error message for non-string values", (value) => {
        expect(validateVolume(value)).toBe(messages.volume.notAString);
    });

    const invalidValues = [
        "volume@123",
        "volume!name",
        "name#",
        "./test",
        "-volume",
        "volume-",
        "_volume",
        "volume_"
    ];

    it.each(invalidValues)("should return error message for invalid characters", (value) => {
        expect(validateVolume(value)).toBe(messages.volume.invalidCharacters);
    });

    it("should handle excessively long strings", () => {
        const longString = "a".repeat(256);

        expect(validateVolume(longString)).toBe(messages.volume.tooLong);
    });
});
