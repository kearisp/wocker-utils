import {render} from "@inquirer/testing";
import {Prompt, Context} from "@inquirer/type";
import {CustomMuteStream} from "../makes/CustomMuteStream";
import {PromptSimulator} from "../makes/PromptSimulator";


export const customRender = async <const C, const V>(
    prompt: Prompt<V, C>,
    config: C,
    options?: Omit<Context, "signal" | "input">
) => {
    const input = new CustomMuteStream(),
          events = new PromptSimulator(input),
          abortController = new AbortController();

    const data = await render(prompt, config, {
        ...options || {},
        input,
        signal: abortController.signal
    });

    events.onAbort(() => {
        data.answer.catch(() => undefined);
        abortController.abort();
    });

    return {
        ...data,
        input,
        events
    };
};
