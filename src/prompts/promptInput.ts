import {
    createPrompt,
    useState,
    useMemo,
    useEffect,
    useKeypress,
    isEnterKey,
    isUpKey,
    isDownKey,
    usePrefix,
    makeTheme,
    Status
} from "@inquirer/core";
import {InquirerReadline, Context} from "@inquirer/type";
import colors from "yoctocolors-cjs";
import {PromptConfig} from "../types/PromptConfig";
import {Theme} from "../types/Theme";
import {validatePrompt} from "../validation/validatePrompt";


type InputValue = string | number;
type ValueType<T extends Config["type"] = "text"> =
    T extends "string" | "text" | "password"
        ? string
        : T extends "int" | "number"
            ? number
            : string;

type PromptFn = <
    V extends ValueType<C["type"]>,
    C extends Config<V> = Config<V>
>(
    config: C,
    context?: Context
) => Promise<V> & {
    cancel: () => void;
};

type Config<V extends InputValue = InputValue> = PromptConfig<V, {
    type?: "text" | "password" | "number";
    step?: number;
    prefix?: string;
    suffix?: string;
}>;

export const promptInput = createPrompt<
    InputValue,
    Config
>(<
    V extends ValueType<C["type"]>,
    C extends Config<V> = Config<V>
>(config: C, done: (value: V) => void) => {
    const {
        message = "Input",
        type = "text",
        step = 1,
        prefix = "",
        suffix = "",
        default: defaultValue
    } = config;

    const theme = makeTheme<Theme>({
        style: {
            message: (message: string) => `${theme.style.highlight(message + ": ")}`,
            value: (value: string, status: Status): string => {
                switch(status) {
                    case "error":
                        return colors.red(value);

                    default:
                        return value;
                }
            }
        }
    }, config.theme);
    const [inputValue = "", setInputValue] = useState<string>(typeof defaultValue === "number" ? defaultValue.toString() : defaultValue),
          [status, setStatus] = useState<Status>("idle"),
          [error, setError] = useState("");

    const value: V = useMemo((): V => {
        switch(config.type) {
            case "number":
                return parseFloat(inputValue) as V;

            default:
                return inputValue as V;
        }
    }, [inputValue, type]);
    const displayValue = useMemo(() => {
        switch(type) {
            case "password":
                return "*".repeat(inputValue.length);

            default:
                return inputValue;
        }
    }, [inputValue, type]);
    const decimalPlaces = useMemo(() => {
        if(type !== "number") {
            return 0;
        }

        const [, inputValueDecimal = ""] = inputValue.split("."),
              [, stepDecimal = ""] = step.toString().split(".");

        return Math.max(inputValueDecimal.length, stepDecimal.length);
    }, [type, step, inputValue]);
    const icon = usePrefix({
        theme,
        status
    });

    const handleUp = (readline: InquirerReadline) => {
        switch(type) {
            case "number": {
                if(typeof value !== "number" || isNaN(value)) {
                    return;
                }

                const inputValue = (value + step).toFixed(decimalPlaces);

                readline.clearLine(-1);
                readline.write(inputValue);
                setInputValue(inputValue);
            }
        }
    };

    const handleDown = (readline: InquirerReadline) => {
        switch(type) {
            case "number": {
                if(typeof value !== "number" || isNaN(value)) {
                    return;
                }

                const inputValue = (value - step).toFixed(decimalPlaces);

                readline.clearLine(-1);
                readline.write(inputValue);
                setInputValue(inputValue);
            }
        }
    };

    const handleChange = (readline: InquirerReadline): void => {
        switch(type) {
            case "number": {
                let [, minus = "", firstPart = "", dot = "", secondPart = ""] = /^(-)?([^.]*)(?:([.,])(.*))?$/.exec(readline.line) || [];

                firstPart = firstPart.replace(/[^0-9]/g, "");
                secondPart = secondPart.replace(/[^0-9]/g, "");

                const inputValue = minus + firstPart + (dot ? "." : "") + secondPart;

                if(inputValue !== readline.line) {
                    readline.clearLine(-1);
                    readline.write(inputValue);
                }

                setInputValue(inputValue);
                break;
            }

            default:
                setInputValue(readline.line);
                break;
        }

        setStatus("idle");
        setError("");
    };

    const handleSubmit = async (readline: InquirerReadline): Promise<void> => {
        setStatus("loading");

        const error = await validatePrompt(value, config);

        if(error) {
            readline.write(inputValue);
            setStatus("error");
            setError(error.message);
            return;
        }

        setStatus("done");
        setError("");
        done(value as any);
    };

    useEffect((readline) => {
        if(!suffix) {
            return;
        }

        const moveCursor = () => {
            const {cols} = readline.getCursorPos();

            readline.output.unmute();
            readline.output.write(`\x1b[${cols + 1 - suffix.length}G`);
            readline.output.mute();
        };

        const handleKeypress = (_: string | undefined, key: any) => {
            const keys = [
                "up",
                "left",
                "right",
                "down",
                "home",
                "end",
                "pageup",
                "pagedown",
                "return"
            ];

            if(keys.includes(key.name)) {
                moveCursor();

                setTimeout(moveCursor, 0);
            }
        };

        readline.input.on("keypress", handleKeypress);

        moveCursor();

        return () => {
            readline.input.removeListener("keypress", handleKeypress);
        };
    }, [displayValue, icon, status, suffix]);

    useKeypress(async (key, readline) => {
        if(isEnterKey(key)) {
            return await handleSubmit(readline);
        }

        if(isUpKey(key)) {
            return handleUp(readline);
        }

        if(isDownKey(key)) {
            return handleDown(readline);
        }

        handleChange(readline);
    });

    return [
        [
            `${icon} `,
            theme.style.message(message, status),
            theme.style.help(prefix),
            theme.style.value(displayValue, status),
            theme.style.help(suffix)
        ].join(""),
        [
            error ? `${theme.style.error(error)}` : ""
        ].join("")
    ];
}) as PromptFn;

export {Config as PromptInputConfig};
