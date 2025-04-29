import {ValidationResult} from "./ValidationResult";


export type Validation<T> = (value: T) => ValidationResult | Promise<ValidationResult>;
