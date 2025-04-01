import {Validation} from "../types/Validation";
import {messages} from "../messages";


export const validateVolume: Validation<unknown> = (value) => {
    if(typeof value === "undefined" || value === null || value === "") {
        return true;
    }

    if(typeof value !== "string") {
        return messages.volume.notAString;
    }

    if(value.length > 255) {
        return messages.volume.tooLong;
    }

    if(!/^[A-Za-z0-9]+(?:[-_]+[A-Za-z0-9]+)*$/.test(value)) {
        return messages.volume.invalidCharacters;
    }

    return true;
};
