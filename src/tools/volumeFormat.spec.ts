import {describe, it, expect} from "@jest/globals";
import {volumeFormat} from "./";
import {VolumeData} from "../types/VolumeData";


describe("volumeFormat", (): void => {
    it.each<{volume: VolumeData, result: string}>([
        {
            volume: {} as VolumeData,
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
