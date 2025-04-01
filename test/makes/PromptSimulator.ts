import {CustomMuteStream} from "./CustomMuteStream";
import {KeypressEvent} from "../../src/types/KeypressEvent";
import EventEmitter from "node:events";


export class PromptSimulator {
    protected emitter: EventEmitter;

    constructor(
        protected readonly input: CustomMuteStream
    ) {
        this.emitter = new EventEmitter();
    }

    public async keypress(key: string | KeypressEvent) {
        const event = typeof key === "string" ? {
            name: key
        } : key;

        return this.input.wait("keypress", null, event);
    }

    public async type(text: string) {
        this.input.write(text);

        for(const char of text) {
            await this.input.wait("keypress", null, {
                name: char
            });
        }
    }

    public async process(events: (string | KeypressEvent)[]): Promise<void> {
        const typeReg = /^type:(.*)$/;

        for(const event of events) {
            if(typeof event === "string" && typeReg.test(event)) {
                const [, text = ""] = typeReg.exec(event) || [];

                await this.type(text);
                continue;
            }

            await this.keypress(event);
        }
    }

    public onAbort(handle: () => void) {
        this.emitter.on("abort", handle);
    }

    public abort() {
        this.emitter.emit("abort");
    }
}
