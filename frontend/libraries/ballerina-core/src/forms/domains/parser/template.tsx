import { Unit } from "../../../../main";
import { LoadValidateAndParseFormsConfig } from "./coroutines/runner";

export const FormsParserTemplate = <T = Unit,>() => LoadValidateAndParseFormsConfig<T>()

