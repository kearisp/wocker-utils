import {describe, it, expect} from "@jest/globals";
import {promptConfirm, PromptConfirmConfig} from "./";
import {KeypressEvent} from "../types/KeypressEvent";
import {customRender} from "../../test/tools/render";


describe("promptConfirm", () => {
    it.each([
        {
            config: {},
            actions: ["type:y", "return"],
            result: true
        },
        {
            config: {},
            actions: ["type:n", "return"],
            result: false
        },
        {
            config: {
                message: "Default true",
                default: true
            },
            actions: ["return"],
            result: true
        }
    ])("should process '$config.message'", async ({config, actions, result}) => {
        const {answer, events} = await customRender(promptConfirm, config);

        await events.process(actions);

        await expect(answer).resolves.toEqual(result);
    });

    it.each<{
        config: PromptConfirmConfig;
        actions: (string | KeypressEvent)[];
        error: string;
    }>([
        {
            config: {},
            actions: ["type:some text", "return"],
            error: "Invalid value"
        },
        {
            config: {
                validate: () => "Custom error"
            },
            actions: ["type:yes", "return"],
            error: "Custom error"
        }
    ])("should shows '$error' error message", async ({config, actions, error}) => {
        const {getScreen, events} = await customRender(promptConfirm, config);

        await events.process(actions);

        expect(getScreen()).toContain(error);

        events.abort();
    });

    it.each<{
        config: PromptConfirmConfig;
        actions: (string | KeypressEvent)[];
        display: string;
    }>([
        {
            config: {},
            actions: ["tab"],
            display: ""
        },
        {
            config: {
                default: true
            },
            actions: ["tab"],
            display: "Yes"
        },
        {
            config: {
                default: false
            },
            actions: ["tab"],
            display: "No"
        },
        {
            config: {
                default: false
            },
            actions: ["type:y", "tab"],
            display: "Yes"
        },
        {
            config: {
                default: true
            },
            actions: ["type:n", "tab"],
            display: "No"
        }
    ])("should complete value", async ({config, actions, display}) => {
        const {getScreen, events} = await customRender(promptConfirm, config);

        await events.process(actions);

        expect(getScreen()).toContain(display);

        events.abort();
    });
});
