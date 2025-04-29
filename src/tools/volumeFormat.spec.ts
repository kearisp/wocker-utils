import {describe, it, expect} from "@jest/globals";
import {volumeFormat, Volume} from "./";


describe("volumeFormat", () => {
    it.each<{volume: Volume, result: string}>([
        {
            volume: {} as Volume,
            result: "/:/"
        },
        {
            volume: {
                source: "./",
                destination: "/"
            },
            result: "./:/"
        },
        {
            volume: {
                source: "./source/path",
                destination: "/destination/path",
                options: "r"
            },
            result: "./source/path:/destination/path:r"
        }
    ])("should format volume $volume", ({volume, result}) => {
        expect(volumeFormat(volume)).toEqual(result);
    });
});
