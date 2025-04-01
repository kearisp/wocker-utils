export type Option = {
    label: string;
    value: string;
};

export type RawOptions = {[value: string]: string;} | (string | Partial<Option>)[];

export const normalizeOptions = (rawOptions: RawOptions): Option[] => {
    if(Array.isArray(rawOptions)) {
        return rawOptions.map((option) => {
            if(typeof option === "string") {
                return {
                    label: option,
                    value: option
                };
            }

            return {
                label: option.label || option.value || "",
                value: option.value || ""
            };
        });
    }

    return Object.keys(rawOptions).map((value) => {
        return {
            label: rawOptions[value],
            value
        };
    });
};
