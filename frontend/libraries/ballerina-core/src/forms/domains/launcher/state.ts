import { Mapping, simpleUpdater, Sum } from "../../../../main"
import { FormsParserState } from "../parser/state"
import { OnChange } from "../singleton/state"

export type FormRunnerContext = {
  value:any
  extraContext:any
  viewWrappers:any
  formName:string
} & FormsParserState
export type FormRunnerState = {
  form:Sum<{ form:any, formState:any, mapping:Mapping<any,any> }, "not initialized">
}
export type FormRunnerForeignMutationsExpected = { onChange:OnChange<any> }
export const FormRunnerState = {
  Default:():FormRunnerState => ({
    form:Sum.Default.right("not initialized"),
  }),
  Updaters:{
    ...simpleUpdater<FormRunnerState>()("form"),
  }
}
