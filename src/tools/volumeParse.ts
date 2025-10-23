import {Volume} from "../makes/Volume";
import {VolumeData} from "../types/VolumeData";


/** @deprecated */
export const volumeParse = (volume: string): VolumeData => {
    try {
        const v = Volume.parse(volume);

        return {
            source: v.source,
            destination: v.destination,
            options: v.options
        };
    }
    catch {
        return {} as VolumeData;
    }
};
