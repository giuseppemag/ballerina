import { Unit } from "../../../../main";
import { LoadValidateAndParseFormsConfig } from "./coroutines/runner";

export const FormsParserTemplate = <T extends {[key in keyof T] : {type: any, state: any}} = Unit>() => LoadValidateAndParseFormsConfig<T>()

