import {ValidationValue} from "./ValidationValue";
import {ValidationValueMessage} from "./ValidationValueMessage";


export type ValidationRule<
    T extends ValidationValue = ValidationValue
> = T | ValidationValueMessage<T>;
