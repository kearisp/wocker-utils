export class Volume {
    public static readonly REGEX = /^([^:]+):([^:]+)(?::([^:]+))?$/;

    public constructor(
        public source: string,
        public destination: string,
        public options?: string
    ) {}

    public toString(): string {
        return `${this.source}:${this.destination}` + (this.options ? `:${this.options}` : "");
    }

    public static parse(volume: string): Volume {
        if(!Volume.REGEX.test(volume)) {
            throw new Error(`Invalid volume format for volume "${volume}"`);
        }

        const [, source = "/", destination = "/", options] = Volume.REGEX.exec(volume) || [];

        return new Volume(source, destination, options);
    }
}
