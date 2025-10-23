import {Volume} from "../makes/Volume";
import {VolumeData} from "../types/VolumeData";


/** @deprecated */
export const volumeFormat = (volume: VolumeData) => {
    return (new Volume(volume.source || "/", volume.destination || "/", volume.options)).toString();
};
