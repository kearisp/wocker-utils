export type RawOptions = string[] | {[value: string]: string;} | {label?: string; value: string;}[];


export const normalizeOptions = (rawOptions: RawOptions) => {
    return Array.isArray(rawOptions)
        ? rawOptions.map((option) => {
            return {
                label: typeof option === "string"
                    ? option
                    : option.label || option.value || "",
                value: typeof option === "string"
                    ? option
                    : option.value || ""
            };
        })
        : Object.keys(rawOptions).map((value) => {
            return {
                label: rawOptions[value],
                value
            };
        });
};
