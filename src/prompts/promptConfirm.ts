import {
    createPrompt,
    useState,
    useMemo,
    useKeypress,
    usePrefix,
    makeTheme,
    Status
} from "@inquirer/core";
import {PromptConfig} from "../types/PromptConfig";
import {Theme} from "../types/Theme";
import {validatePrompt} from "../validation/validatePrompt";


type Config = Omit<PromptConfig<boolean>, "min" | "max" | "minLength" | "maxLength">;

export const promptConfirm = createPrompt<boolean, Config>((
    config,
    done
) => {
    const {
        message = "Confirm",
        default: defaultValue = false
    } = config;

    const [status, setStatus] = useState<Status>("idle"),
          [inputValue, setInputValue] = useState(""),
          [error, setError] = useState(""),
          icon = usePrefix({status});
    const result = useMemo(() => {
        if(inputValue) {
            if(/^y(es?)?$/i.test(inputValue)) {
                return true;
            }
            else if(/^(n|no)$/i.test(inputValue)) {
                return false;
            }

            return undefined;
        }

        return defaultValue;
    }, [inputValue, defaultValue]);

    const theme: Theme = makeTheme<Theme>({}, config.theme);

    useKeypress(async (key, readline) => {
        setStatus("idle");
        setError("");

        switch(key.name) {
            case "return":
                setInputValue("");

                if(typeof result === "undefined") {
                    setStatus("error");
                    setError("Invalid value");
                    break;
                }

                const error = await validatePrompt(result, config);

                if(error) {
                    setStatus("error");
                    setError(error.message);
                    break;
                }

                setStatus("done");
                done(result);
                break;

            case "tab":
                const inputValue = result ? "Yes" : "No";

                readline.clearLine(0);
                readline.write(inputValue);

                setInputValue(inputValue);
                break;

            default:
                setInputValue(readline.line);
                break;
        }
    });

    return [
        [
            `${icon} `,
            theme.style.message(message, status),
            " ",
            theme.style.defaultAnswer(config.default ? "Y/n" : "y/N"),
            " ",
            inputValue
        ].join(""),
        error
            ? theme.style.error(error)
            : ""
    ];
});

export type {Config as PromptConfirmConfig};
