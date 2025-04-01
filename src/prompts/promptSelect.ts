import {
    createPrompt,
    useState,
    usePrefix,
    useMemo,
    usePagination,
    useKeypress,
    makeTheme,
    Status
} from "@inquirer/core";
import {Context} from "@inquirer/type";
import figures from "@inquirer/figures";
import ansiEscapes from "ansi-escapes";
import colors from "yoctocolors-cjs";
import {PromptConfig} from "../types/PromptConfig";
import {Theme} from "../types/Theme";
import {KeypressEvent} from "../types/KeypressEvent";
import {normalizeOptions, RawOptions} from "../tools";
import {validatePrompt} from "../validation/validatePrompt";


type SelectValue = string | string[];

type PromptFn = <
    V extends C["multiple"] extends true ? string[] : string,
    C extends Config<V> = Config<V>
>(
    config?: C,
    context?: Context
) => Promise<V> & {
    cancel: () => void;
};

type Config<V> = PromptConfig<V, {
    options: RawOptions;
    topHelp?: string;
    multiple?: boolean;
    pageSize?: number;
    default?: V;
}>;

const selectView = <
    V extends C["multiple"] extends true ? string[] : string,
    C extends Config<V> = Config<V>
>(config: C, done: (value: V) => void): string | [string, string | undefined] => {
    const {
        message = "Select",
        multiple,
        pageSize = 5,
        options: rawOptions = []
    } = config;

    const theme = makeTheme<Theme>({
        style: {
            message: (message: string) => colors.bold(`${message}: `),
            value: (value: string, status: Status): string => {
                switch(status) {
                    case "selected":
                        return colors.green(value);

                    case "active":
                        return colors.blue(value);

                    case "done":
                        return colors.cyan(value);

                    default:
                        return value;
                }
            }
        }
    }, config.theme);
    const options = useMemo(() => {
        const options = normalizeOptions(rawOptions);

        if(options.length === 0) {
            throw new Error("No selectable choices");
        }

        return options;
    }, [rawOptions]);

    const [status, setStatus] = useState<Status>("idle"),
          [showHint, setShowHint] = useState(true),
          [values, setValues] = useState<string[]>(typeof config.default === "string" ? [config.default] : config.default || []),
          [active, setActive] = useState<number>(values.length > 0 ? options.findIndex((o) => o.value === values[0]) : 0),
          [error, setError] = useState(""),
          icon = usePrefix({theme, status});

    const activeOption = useMemo(() => {
        return options[active];
    }, [options, active]);
    const selectedOptions = useMemo(() => {
        return options.filter((option) => {
            return values.includes(option.value);
        });
    }, [options, values]);
    const displayValue = useMemo(() => {
        if(multiple) {
            return selectedOptions
                .map((option) => option.label)
                .join(", ");
        }

        return activeOption.label;
    }, [activeOption, selectedOptions]);

    // noinspection JSUnusedGlobalSymbols
    const page = usePagination({
        items: options,
        active,
        pageSize,
        renderItem: ({item, isActive}) => {
            const selected = values.includes(item.value),
                  status = selected || (isActive && !multiple) ? "selected" : "idle";

            return [
                isActive
                    ? theme.style.value(figures.pointer, "active")
                    : " ",
                " ",
                multiple ?
                    (selected ? colors.green(figures.circleFilled) : figures.circleDotted) + " "
                    : "",
                theme.style.value(item.label, status)
            ].join("");
        }
    });

    useKeypress(async (key: KeypressEvent, readline) => {
        readline.clearLine(0);

        setStatus("idle");
        setShowHint(false);
        setError("");

        if(key.name === "a" && key.ctrl) {
            if(!multiple) {
                return;
            }

            setValues(options.map(o => o.value));
            return;
        }

        switch(key.name) {
            case "up":
            case "down": {
                const offset = key.name === "up" ? -1 : 1;
                let next = active;

                do {
                    next = (next + offset + options.length) % options.length;
                }
                while(!options[next]);

                setActive(next);

                if(!multiple) {
                    setValues([
                        options[next].value
                    ]);
                }
                break;
            }

            case "space":
                if(!multiple) {
                    return;
                }

                if(values.includes(activeOption.value)) {
                    setValues([
                        ...values.slice(0, values.indexOf(activeOption.value)),
                        ...values.slice(values.indexOf(activeOption.value) + 1)
                    ]);
                }
                else {
                    setValues([
                        ...values,
                        activeOption.value
                    ]);
                }
                break;

            case "return":
                const result = config.multiple
                    ? values
                    : activeOption.value;

                setStatus("loading");

                const error = await validatePrompt(result, config);

                if(error) {
                    setStatus("error");
                    setError(error.message);
                    return;
                }

                setStatus("done");
                done(result as V);
                break;
        }
    });

    return [
        [
            `${icon} `,
            theme.style.message(message, status),
            showHint
                ? theme.style.help("(Use arrow keys)") + " "
                : "",
            status !== "done"
                ? `\n${page}`
                : theme.style.value(displayValue, status),
            ansiEscapes.cursorHide
        ].join(""),
        [
            error ? theme.style.error(error) : ""
        ].join("")
    ];
};

export const promptSelect = createPrompt<
    SelectValue,
    Config<SelectValue>
>(selectView) as PromptFn;

export {Config as PromptSelectConfig};
