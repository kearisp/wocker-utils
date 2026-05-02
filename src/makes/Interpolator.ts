export class Interpolator {
    protected static KEY = "__PLACEHOLDER_PATTERN__";
    protected normalizer: Interpolator.Normalizer;
    protected clearMissing: boolean;

    public constructor(options: Interpolator.Options = {}) {
        const {
            clearMissing = false,
            normalizer = (k: string) => [`$${k.trim()}`, `\${${k.trim()}}`]
        } = options;

        this.clearMissing = clearMissing;
        this.normalizer = normalizer;
    }

    protected normalize(key: string): string[] {
        const patterns = this.normalizer(key);

        return Array.isArray(patterns) ? patterns : [patterns];
    }

    protected pattern() {
        const regs = this.normalize(Interpolator.KEY)
            .map((pattern) => {
                return Interpolator.escapeRegExp(pattern);
            })
            .join("|")
            .replace(new RegExp(Interpolator.KEY, "g"), "([a-zA-Z0-9_-]+)");

        return new RegExp(regs, "g");
    }

    public pluralize(template: string, choice: number): string {
        const segments = template.split("|");

        for(const segment of segments) {
            const match = segment.trim().match(/^(\{\d+}|\[[\d*]+,[\d*]+])\s*(.*)$/);

            if(!match) {
                continue;
            }

            const rule = match[1];
            const text = match[2];

            if(Interpolator.checkRule(rule, choice)) {
                return text;
            }
        }

        return "";
    }

    public interpolate(template: string, params: Record<string, any>): string {
        let result = template;

        const replacements: {
            pattern: string;
            value: string;
        }[] = [];

        const processedKeys = new Set<string>();

        for(const key of Object.keys(params)) {
            const patterns = this.normalize(key),
                  value = String(params[key] ?? "");

            for(const pattern of patterns) {
                processedKeys.add(pattern);

                replacements.push({
                    pattern,
                    value
                });
            }
        }

        if(this.clearMissing) {
            const tokens = template.match(this.pattern());

            if(tokens) {
                const potentialKeys = Array.from(new Set(tokens));

                for(const key of potentialKeys) {
                    if(processedKeys.has(key)) {
                        continue;
                    }

                    replacements.push({
                        pattern: key,
                        value: ""
                    });
                }
            }
        }

        replacements.sort((a, b) => b.pattern.length - a.pattern.length);

        for(const {pattern, value} of replacements) {
            const regex = new RegExp(Interpolator.escapeRegExp(pattern), "g");

            result = result.replace(regex, value);
        }

        return result;
    }

    public getVariables(template: string): string[] {
        const tokens = template.match(this.pattern());

        if(!tokens) {
            return [];
        }

        const variables = new Set<string>(),
              patterns = this.normalize(Interpolator.KEY);

        for(const token of tokens) {
            for(const pattern of patterns) {
                const reg = new RegExp(
                    `^${Interpolator.escapeRegExp(pattern)}$`
                        .replace(new RegExp(Interpolator.KEY, "g"), "([a-zA-Z0-9_-]+)")
                );

                const [, key] = reg.exec(token) || [];

                if(key) {
                    variables.add(key);
                    break;
                }
            }
        }

        return Array.from(variables);
    }

    protected static checkRule(rule: string, choice: number): boolean {
        if(rule.startsWith("{")) {
            const value = parseInt(rule.slice(1, -1));

            return value === choice;
        }

        if(rule.startsWith("[")) {
            const parts = rule.slice(1, -1).split(",");
            const min = parts[0] === "*" ? -Infinity : parseInt(parts[0]);
            const max = parts[1] === "*" ? Infinity : parseInt(parts[1]);

            return choice >= min && choice <= max;
        }

        return false;
    }

    protected static escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}

export namespace Interpolator {
    export type Normalizer = (key: string) => string | string[];

    export type Options = {
        normalizer?: Normalizer;
        clearMissing?: boolean;
    };
}
