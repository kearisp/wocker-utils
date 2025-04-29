import {describe, it, expect} from "@jest/globals";
import {render} from "@inquirer/testing";
import {promptInput, PromptInputConfig} from "./";
import {messages} from "../messages";
import {customRender} from "../../test/tools/render";


describe("promptInput", () => {
    const getSnapshot = (config: PromptInputConfig, value: any = "", error?: string) => {
        const {
            message = "Value",
            prefix = "",
            suffix = ""
        } = config;

        const firstLine = `? ${message}: ${prefix}${value}${suffix}`;

        if(!error) {
            return `"${firstLine.trim()}"`;
        }

        return `\n"${firstLine}\n> ${error}"\n`;
    };

    it.each<{
        name: string;
        config: PromptInputConfig<any>;
        input: string;
        display?: string;
        result?: any;
    }>([
        {
            name: "Test with prefix",
            config: {
                message: "Test with prefix",
                prefix: "https://"
            },
            input: "domain.com",
        },
        {
            name: "Test with suffix",
            config: {
                message: "Test with suffix",
                suffix: "/suffix"
            },
            input: "Test",
        },
        {
            name: "Test with prefix and suffix",
            config: {
                message: "Test with prefix and suffix",
                prefix: "https://",
                suffix: ".com"
            },
            input: "domain",
        },
        {
            name: "Test number",
            config: {
                message: "Test number",
                type: "number"
            },
            input: "1",
            result: 1
        },
        {
            name: "Test password",
            config: {
                message: "Test password",
                type: "password"
            },
            ...(() => {
                const password = "secret-password";

                return {
                    input: password,
                    display: "*".repeat(password.length)
                };
            })()
        }
    ])("should precess input", async ({config, input, display, result}) => {
        const {
            answer,
            events,
            getScreen
        } = await render(promptInput, config);

        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, config.default));

        events.type(input);
        events.keypress("enter");

        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, display || input));

        await expect(answer).resolves.toEqual(result || input);
    });

    it("should display error", async () => {
        const config = {
            message: "Text",
            type: "text" as const,
            required: true
        };

        const {
            getScreen,
            events
        } = await customRender(promptInput, config);

        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, ""));

        await events.keypress("enter");

        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, "", messages.required));

        events.abort();
    });

    it("should increased and decreased number", async () => {
        const config = {
            message: "Number value",
            type: "number" as const,
        };

        const {
            getScreen,
            events
        } = await customRender(promptInput, config);

        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config));

        await events.type("10");
        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, "10"));

        await events.keypress("up");
        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, "11"));

        await events.keypress("down");
        expect(getScreen()).toMatchInlineSnapshot(getSnapshot(config, "10"));

        events.abort();
    });
});
