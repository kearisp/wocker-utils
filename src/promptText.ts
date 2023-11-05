import inquirer from "inquirer";
import chalk from "chalk";


type Options = {
    required?: boolean;
    message?: string;
    prefix?: string;
    suffix?: string;
    type?: "string" | "number" | "int";
    default?: number | string;
};

export const promptText = async (options: Options) => {
    const {
        required,
        message,
        prefix = "",
        suffix = "",
        type,
        default: defaultValue
    } = options;

    const {value} = await inquirer.prompt({
        name: "value",
        type: "input",
        message,
        default: defaultValue,
        validate(value: any): boolean | string | Promise<boolean | string> {
            if(required) {
                if(typeof value === "undefined" || value === "") {
                    return "Mandatory value";
                }
            }

            if(type === "int" || type === "number") {
                if(isNaN(parseInt(value)) || parseInt(value).toString() !== value) {
                    return "Should be integer";
                }
            }

            return true;
        },
        transformer(value: any): string | Promise<string> {
            if(!prefix && !suffix) {
                return value;
            }

            if(suffix) {
                setTimeout(() => {
                    process.stdout.write(`\x1b[${suffix.length}D`);
                }, 0);
            }

            return `${chalk.gray(prefix)}${value}${chalk.gray(suffix)}`;
        }
    });

    return value;
};

export {Options as PromptTextOptions};
