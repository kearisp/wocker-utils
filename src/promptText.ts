import inquirer from "inquirer";
import chalk from "chalk";


type Options = {
    required?: boolean;
    message?: string;
    prefix?: string;
    suffix?: string;
    type?: "string" | "number" | "int" | "password";
    default?: number | string;
    validate?: (value?: string) => boolean | string | Promise<boolean | string>;
};

export const promptText = async (options: Options) => {
    const {
        required,
        message,
        prefix = "",
        suffix = "",
        type,
        default: defaultValue,
        validate
    } = options;

    const {value} = await inquirer.prompt({
        name: "value",
        type: (() => {
            switch(type) {
                case "password":
                    return type;

                default:
                    return "input";
            }
        })(),
        message,
        default: defaultValue,
        validate(value?: any): boolean | string | Promise<boolean | string> {
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

            if(validate) {
                return validate(value);
            }

            return true;
        },
        transformer(value: any): string {
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
