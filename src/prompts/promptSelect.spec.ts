import {describe, it, expect} from "@jest/globals";
import {promptSelect, PromptSelectConfig} from "./promptSelect";
import {KeypressEvent} from "../types/KeypressEvent";
import {customRender} from "../../test/tools/render";


describe("promptSelect", () => {
    it.each<{
        config: PromptSelectConfig<string | string[]>;
        actions: (string | KeypressEvent)[];
        result: string | string[];
    }>([
        {
            config: {
                options: ["Test", "Bar"]
            },
            actions: ["return"],
            result: "Test"
        },
        {
            config: {
                message: "Select",
                options: ["Test", "Bar"]
            },
            actions: ["down", "return"],
            result: "Bar"
        },
        {
            config: {
                message: "Select nothing",
                multiple: true,
                options: ["Test", "Bar"],
            },
            actions: ["space", "space", "return"],
            result: []
        },
        {
            config: {
                message: "Select multiple",
                multiple: true,
                options: ["Test", "Foo", "Bar"],
            },
            actions: ["space", "space", "down", "space", "down", "space", "return"],
            result: ["Foo", "Bar"]
        },
        {
            config: {
                message: "Select default",
                options: ["Foo", "Bar"],
                default: "Bar"
            },
            actions: ["return"],
            result: "Bar"
        },
        {
            config: {
                message: "Select default not in list",
                options: ["Foo", "Bar"],
                default: "Test"
            },
            actions: ["return"],
            result: "Foo"
        },
        {
            config: {
                message: "Select default multiple",
                multiple: true,
                options: ["Foo-1", "Bar-1", "Foo-2", "Bar-2"],
                default: ["Bar-1", "Bar-2"]
            },
            actions: ["return"],
            result: ["Bar-1", "Bar-2"]
        },
        {
            config: {
                message: "Select all",
                options: ["Foo", "Bar"]
            },
            actions: [{name: "a", ctrl: true}, "return"],
            result: "Foo"
        },
        {
            config: {
                message: "Select all multiple",
                multiple: true,
                options: ["Foo", "Bar"]
            },
            actions: [{name: "a", ctrl: true}, "return"],
            result: ["Foo", "Bar"]
        }
    ])("should process $config.message", async ({config, actions, result}) => {
        const {events, answer} = await customRender(promptSelect as any, config);

        await events.process(actions);

        await expect(answer).resolves.toEqual(result);
    });

    it("should show correct UI states during up/down navigation", async () => {
        const config = {
            message: "Select",
            multiple: false,
            options: ["Option 1", "Option 2", "Option 3"]
        };

        const {
            getScreen,
            events,
            answer
        } = await customRender(promptSelect as any, config);

        expect(getScreen()).toMatchInlineSnapshot(`\n"? Select: (Use arrow keys)\n❯ Option 1\n  Option 2\n  Option 3"\n`);

        await events.keypress("down");

        expect(getScreen()).toMatchInlineSnapshot(`\n"? Select: \n  Option 1\n❯ Option 2\n  Option 3"\n`);

        await events.keypress("down");

        expect(getScreen()).toMatchInlineSnapshot(`\n"? Select: \n  Option 1\n  Option 2\n❯ Option 3"\n`);

        await events.keypress("up");

        expect(getScreen()).toMatchInlineSnapshot(`\n"? Select: \n  Option 1\n❯ Option 2\n  Option 3"\n`);

        await events.keypress("down");
        await events.keypress("down");

        expect(getScreen()).toMatchInlineSnapshot(`\n"? Select: \n❯ Option 1\n  Option 2\n  Option 3"\n`);

        await events.keypress("return");

        await expect(answer).resolves.toEqual("Option 1");
    });

    it.each([
        {
            config: {
                message: "Empty options list",
                options: []
            }
        },
        {
            config: {
                message: "No options"
            }
        }
    ])("should throw an exception when options array is empty", async ({config}) => {
        const {answer} = await customRender(promptSelect as any, config);

        await expect(answer).rejects.toThrow();
    });

    it("should show an error message", async () => {
        const errorMessage = "Invalid value";
        const config: PromptSelectConfig<string> = {
            message: "Invalid",
            options: [
                "Foo", "Bar"
            ],
            validate: () => "Invalid value"
        };

        const {
            getScreen,
            events
        } = await customRender(promptSelect as any, config);

        await events.keypress("return");

        expect(getScreen()).toContain(errorMessage);

        events.abort();
    });
});
