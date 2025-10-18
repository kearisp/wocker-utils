import {
    createPrompt,
    useState,
    useMemo,
    useEffect,
    useKeypress,
    usePrefix,
    usePagination,
    isEnterKey,
    isTabKey,
    isUpKey,
    isDownKey,
    makeTheme,
    Status
} from "@inquirer/core";
import figures from "@inquirer/figures";
import {InquirerReadline} from "@inquirer/type";
import FS from "fs";
import Path from "path";
import {PromptConfig} from "../types/PromptConfig";
import {Theme} from "../types/Theme";
import {validatePrompt} from "../validation/validatePrompt";
import {prepareMessage} from "../tools/prepareMessage";
import {prepareValue} from "../tools/prepareValue";
import {prepareHelp} from "../tools/prepareHelp";


type Config = PromptConfig<string, {
    type?: "file" | "directory" | "any";
    basePath?: string;
    showHidden?: boolean;
}>;

export const promptPath = createPrompt<string, Config>((config: Config, done: (value: string) => void) => {
    const {
        message = "Enter path",
        type = "any",
        basePath = process.cwd(),
        showHidden = false,
        default: defaultValue = ""
    } = config;

    const theme = makeTheme<Theme>({
        style: {
            message: prepareMessage,
            value: prepareValue,
            help: prepareHelp
        }
    }, config.theme);
    const [inputValue, setInputValue] = useState(defaultValue),
          [status, setStatus] = useState<Status>("idle"),
          [error, setError] = useState(""),
          [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [base, currentDir] = useMemo((): [string, string] => {
        const fullPath = inputValue
            ? (Path.isAbsolute(inputValue) ? inputValue : Path.join(basePath, inputValue))
            : basePath;

        try {
            const stat = FS.statSync(fullPath);

            if(stat.isDirectory()) {
                return ["", fullPath];
            }
        }
        catch(err) {}

        return inputValue
            ? [Path.basename(fullPath), Path.dirname(fullPath)]
            : ["", fullPath];
    }, [inputValue]);
    const suggestions = useMemo((): string[] => {
        try {
            if(!FS.existsSync(currentDir)) {
                return [];
            }

            const files = FS.readdirSync(currentDir);

            return files
                .filter(file => {
                    if(!showHidden && file.startsWith("."))
                        return false;

                    if(!file.toLowerCase().startsWith(base.toLowerCase()))
                        return false;

                    const filePath = Path.join(currentDir, file);
                    const stats = FS.statSync(filePath);

                    if(type === "file")
                        return stats.isFile();

                    if(type === "directory")
                        return stats.isDirectory();

                    return true;
                })
                .sort((a, b) => {
                    const aPath = Path.join(currentDir, a);
                    const bPath = Path.join(currentDir, b);
                    const aIsDir = FS.statSync(aPath).isDirectory();
                    const bIsDir = FS.statSync(bPath).isDirectory();

                    if(aIsDir && !bIsDir)
                        return -1;

                    if(!aIsDir && bIsDir)
                        return 1;

                    return a.localeCompare(b);
                });
        }
        catch(err) {
            return [];
        }
    }, [inputValue]);

    const icon = usePrefix({ theme, status });

    const page = usePagination({
        items: suggestions,
        active: selectedSuggestion,
        pageSize: 6,
        renderItem: ({item, isActive}) => {
            const status = isActive
                ? "selected"
                : "idle";

            return [
                isActive
                    ? theme.style.value(figures.pointer, "active")
                    : " ",
                " ",
                theme.style.value(item, status)
            ].join("");
        }
    });

    const handleUp = (): void => {
        setSelectedSuggestion((suggestions.length + selectedSuggestion - 1) % suggestions.length);
    };

    const handleDown = (): void => {
        if(suggestions.length === 0) {
            return;
        }

        setSelectedSuggestion((selectedSuggestion + 1) % suggestions.length);
    };

    const handleChange = (readline: InquirerReadline): void => {
        setInputValue(readline.line);
        setSelectedSuggestion(0);
        setStatus("idle");
        setError("");
    };

    const handleTab = (readline: InquirerReadline): void => {
        if(suggestions.length === 0)
            return;

        const suggestion = suggestions[selectedSuggestion];
        const newPath = Path.join(currentDir, suggestion);
        const relativePath = Path.isAbsolute(inputValue)
            ? newPath
            : Path.relative(basePath, newPath);

        const stats = FS.statSync(newPath);
        const finalPath = stats.isDirectory()
            ? relativePath + Path.sep
            : relativePath;

        readline.clearLine(-1);
        readline.write(finalPath);
        setInputValue(finalPath);
        setSelectedSuggestion(0);
    };

    const handleSubmit = async (readline: InquirerReadline): Promise<void> => {
        setStatus("loading");

        const error = await validatePrompt(inputValue, config);

        if(error) {
            readline.write(inputValue);
            setStatus("error");
            setError(error.message);
            return;
        }

        setStatus("done");
        setError("");
        done(inputValue);
    };

    useEffect((): void => {
        setSelectedSuggestion(0);
    }, [inputValue]);

    useKeypress(async (key, readline): Promise<void> => {
        if(isEnterKey(key)) {
            return await handleSubmit(readline);
        }

        if(isTabKey(key)) {
            return handleTab(readline);
        }

        if(isUpKey(key)) {
            return handleUp();
        }

        if(isDownKey(key)) {
            return handleDown();
        }

        handleChange(readline);
    });

    return [
        [
            `${icon} `,
            theme.style.message(message, status),
            theme.style.value(inputValue, status)
        ].join(""),
        [
            error ? `${theme.style.error(error)}` : "",
            status !== "done" && page ? `\n${page}` : ""
        ].join("")
    ];
});
