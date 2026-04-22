export class Image {
    public static readonly REGEX = /^(?:(?<registry>[a-zA-Z0-9][a-zA-Z0-9._-]*\.[a-zA-Z]{2,}(?::\d+)?|localhost(?::\d+)?)\/)?(?:(?<repository>[a-z0-9._-]+(?:\/[a-z0-9._-]+)*)\/)?(?<name>[a-z0-9][a-z0-9._-]*)(?::(?<tag>[a-zA-Z0-9][a-zA-Z0-9._-]*))?(?:@(?<digest>[a-zA-Z0-9:]+))?$/;

    public constructor(
        public name: string,
        public tag?: string,
        public registry?: string,
        public repository?: string,
        public digest?: string
    ) {}

    public toString(): string {
        let image = "";

        if(this.registry) {
            image += `${this.registry}/`;
        }

        if(this.repository) {
            image += `${this.repository}/`;
        }

        image += this.name;

        if(this.tag) {
            image += `:${this.tag}`;
        }

        if(this.digest) {
            image += `@${this.digest}`;
        }

        return image;
    }

    public isValid(image: string): boolean {
        return Image.REGEX.test(image);
    }

    public static parse(image: string): Image {
        const match = Image.REGEX.exec(image);

        if(!match) {
            throw new Error(`Invalid image format: "${image}"`);
        }

        const {
            registry,
            repository,
            name,
            tag,
            digest
        } = match.groups as {
            registry?: string;
            repository?: string;
            name: string;
            tag?: string;
            digest?: string;
        };

        return new Image(
            name,
            tag,
            registry,
            repository,
            digest
        );
    }
}
