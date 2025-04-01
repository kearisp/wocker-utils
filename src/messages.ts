export const messages = {
    required: "Mandatory value",
    min: (min: number) => `The value must be greater that ${min}`,
    max: (max: number) => `The value must be less than ${max}`,
    minLength: (min: number) => `The value must have at least ${min} characters.`,
    maxLength: (max: number) => `The value must not exceed ${max} characters.`,
    minArrayLength: (min: number) => `The value must have at least ${min} items.`,
    maxArrayLength: (max: number) => `The value must not exceed ${max} items.`,
    custom: "Invalid value",
    volume: {
        notAString: "Volume name should be string.",
        tooLong: "Volume name must not exceed 255 characters.",
        invalidCharacters: "Invalid volume name. Only alphanumeric characters, single hyphens (-), and underscores (_) are allowed. The name must not start or end with a hyphen or underscore."
    }
};
