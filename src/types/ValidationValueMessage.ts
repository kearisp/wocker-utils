import {ValidationValue} from "./ValidationValue";

export type ValidationValueMessage<
    T extends ValidationValue = ValidationValue
> = {
    message: string;
    value: T;
};
