import {describe, it, expect} from "@jest/globals";
import {volumeParse} from "./";


describe("volumeParse", (): void => {
    it.each([
        {
            volume: "",
            result: {}
        },
        {
            volume: "./test:/test",
            result: {
                source: "./test",
                destination: "/test"
            }
        },
        {
            volume: "./test:/test:rw",
            result: {
                source: "./test",
                destination: "/test",
                options: "rw"
            }
        }
    ])("should parse volume $volume", ({volume, result}): void => {
        expect(volumeParse(volume)).toEqual(result);
    });
});
