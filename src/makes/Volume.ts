export class Volume {
    public static readonly REGEX = /^([^:]+):([^:]+)(?::([^:]+))?$/;

    public constructor(
        public source: string,
        public destination: string,
        public options?: string
    ) {}

    public toString(): string {
        return `${this.source}:${this.destination}`;
    }

    public static parse(volume: string): Volume {
        const [, source, destination, options] = Volume.REGEX.exec(volume) || [];

        return new Volume(source, destination, options);
    }
}
