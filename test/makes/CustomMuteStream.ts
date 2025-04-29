import MuteStream from "mute-stream";


export class CustomMuteStream extends MuteStream {
    protected _listeners: {
        [event: string]: Map<any, any>;
    } = {};
    protected _waiters: {
        [event: string]: {
            completed: number;
            resolve: (value: void | PromiseLike<void>) => void;
        };
    } = {};

    protected getOverride(event: string, listener: any) {
        if(!this._listeners) {
            this._listeners = {};
        }

        if(!this._listeners[event]) {
            this._listeners[event] = new Map();
        }

        let override = this._listeners[event].get(listener);

        if(!override) {
            override = async (...args: any[]) => {
                const result = await listener(...args);

                if(!this._waiters) {
                    this._waiters = {};
                }

                if(this._waiters[event]) {
                    this._waiters[event].completed++;

                    if(this._waiters[event].completed === this._listeners[event].size) {
                        this._waiters[event].resolve();
                    }
                }

                return result;
            };

            this._listeners[event].set(listener, override);
        }

        return override;
    }

    protected hasOverride(event: string, listener: any) {
        return this._listeners && this._listeners[event] && this._listeners[event].has(listener);
    }

    protected removeOverride(event: string, listener: any) {
        if(!this.hasOverride(event, listener)) {
            return;
        }

        this._listeners[event].delete(listener);
    }

    public on(event: any, listener: any): this {
        const override = this.getOverride(event, listener);

        super.on(event, override);

        return this;
    }

    public addListener(event: any, listener: any): this {
        const override = this.getOverride(event, listener);

        super.addListener(event, override);

        return this;
    }

    public off(event: any, listener: any): this {
        if(this.hasOverride(event, listener)) {
            const override = this.getOverride(event, listener);
            super.off(event, override);
            this.removeOverride(event, listener);
        }
        else {
            super.off(event, listener);
        }

        return this;
    }

    public removeListener(event: any, listener: any): this {
        if(this.hasOverride(event, listener)) {
            const override = this.getOverride(event, listener);

            super.removeListener(event, override);
            this.removeOverride(event, listener);
        }
        else {
            super.removeListener(event, listener);
        }

        return this;
    }

    public async wait(event: string, data: any, key: any): Promise<void> {
        return new Promise<void>((resolve) => {
            this._waiters[event] = {
                resolve,
                completed: 0
            };

            this.emit(event, data, key);
        });
    }
}
