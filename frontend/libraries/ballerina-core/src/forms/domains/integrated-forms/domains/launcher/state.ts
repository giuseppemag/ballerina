import { Sum, Unit, simpleUpdater } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"
import { IntegratedFormParsingResult, IntegratedFormsParserState } from "../parser/state"

export type IntegratedFormRef = {
    formName:string
  } 

export type IntegratedFormRunnerContext = {
    extraContext:any
    formRef:IntegratedFormRef
    showFormParsingErrors: BasicFun<IntegratedFormParsingResult, JSX.Element>
} & IntegratedFormsParserState
export type IntegratedFormRunnerState = {
    form:Sum<{ form:any, formFieldStates:any, entity:any, rawEntity:any, commonFormState:any, customFormState:any, globalConfiguration:any }, "not initialized">
}
export type IntegratedFormRunnerForeignMutationsExpected = Unit
export const IntegratedFormRunnerState = {
Default:():IntegratedFormRunnerState => ({
    form:Sum.Default.right("not initialized"),
}),
Updaters:{
    ...simpleUpdater<IntegratedFormRunnerState>()("form"),
}
}
