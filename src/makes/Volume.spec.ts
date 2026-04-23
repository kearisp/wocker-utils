import {describe, it, expect} from "@jest/globals";
import {Volume} from "./Volume";


describe("Volume", () => {
    describe("parse", () => {
        it("should parse simple volume", () => {
            const volume = Volume.parse("/src:/dest");

            expect(volume.source).toBe("/src");
            expect(volume.destination).toBe("/dest");
            expect(volume.options).toBeUndefined();
        });

        it("should parse volume with options", () => {
            const volume = Volume.parse("/src:/dest:ro");

            expect(volume.source).toBe("/src");
            expect(volume.destination).toBe("/dest");
            expect(volume.options).toBe("ro");
        });

        it("should throw error for invalid format", () => {
            expect(() => Volume.parse("invalid")).toThrow("Invalid volume format for volume \"invalid\"");
        });
    });

    describe("isValid", () => {
        it("should return true for valid volume", () => {
            expect(Volume.isValid("/src:/dest")).toBe(true);
        });

        it("should return true for valid volume with options", () => {
            expect(Volume.isValid("/src:/dest:ro")).toBe(true);
        });

        it("should return false for invalid volume", () => {
            expect(Volume.isValid("invalid")).toBe(false);
        });
    });

    describe("toString", () => {
        it("should return correct string for simple volume", () => {
            const volume = new Volume("/src", "/dest");

            expect(volume.toString()).toBe("/src:/dest");
        });

        it("should return correct string for volume with options", () => {
            const volume = new Volume("/src", "/dest", "ro");

            expect(volume.toString()).toBe("/src:/dest:ro");
        });
    });
});
