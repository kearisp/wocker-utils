import {describe, it, expect} from "@jest/globals";
import {validatePrompt} from "./validatePrompt";
import {messages} from "../messages";


describe("validatePrompt", () => {
    it.each([
        {
            value: undefined,
            config: {
                required: true
            },
            errorMessage: messages.required
        },
        {
            value: undefined,
            config: {
                required: "Test required"
            },
            errorMessage: "Test required"
        },
        {
            value: "a".repeat(5),
            config: {
                minLength: 10
            },
            errorMessage: messages.minLength(10)
        },
        {
            value: 4,
            config: {
                min: 5
            },
            errorMessage: messages.min(5)
        },
        {
            value: 20,
            config: {
                max: 10
            },
            errorMessage: messages.max(10)
        },
        {
            value: 4,
            config: {
                minLength: 10
            },
            errorMessage: messages.minLength(10)
        },
        {
            value: Array.from({length: 5}),
            config: {
                minLength: 10
            },
            errorMessage: messages.minArrayLength(10)
        },
        {
            value: "a".repeat(20),
            config: {
                maxLength: 10
            },
            errorMessage: messages.maxLength(10)
        },
        {
            value: 100,
            config: {
                maxLength: 2
            },
            errorMessage: messages.maxLength(2)
        },
        {
            value: Array.from({length: 20}),
            config: {
                maxLength: 10
            },
            errorMessage: messages.maxArrayLength(10)
        },
        {
            value: "Test",
            config: {
                validate: () => "Custom validator 1"
            },
            errorType: "custom",
            errorMessage: "Custom validator 1"
        },
        {
            value: "Test",
            config: {
                validate: {
                    customValidator: () => false
                }
            },
            errorType: "custom",
            errorMessage: messages.custom
        }
    ])("should return error '$errorMessage'", async ({value, config, errorType, errorMessage}) => {
        const error = await validatePrompt(value, config);

        expect(error).not.toBeNull();
        expect(error?.message).toBe(errorMessage);

        if(errorType) {
            expect(error?.type).toBe(errorType);
        }
    });
});
