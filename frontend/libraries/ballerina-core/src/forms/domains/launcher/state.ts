import { BasicFun, Guid, Mapping, simpleUpdater, Sum, Unit } from "../../../../main"
import { FormParsingResult, FormsParserState } from "../parser/state"
import { OnChange } from "../singleton/state"

export type FormRefApiHandlers<Arg> = {
  success?: (_: Arg) => void,
  error?: (_: Arg) => void,
}

export type FormRef = {
  formName:string
} & ({
  kind:"edit",
  submitButtonWrapper:any
  entityId:Guid,
  apiHandlers?: FormRefApiHandlers<any>
} | {
  kind:"map",
  onChange:OnChange<any>
  value:any
} | {
  kind:"create",
  apiHandlers?: FormRefApiHandlers<any>,
  submitButtonWrapper:any
})

export type FormRunnerContext = {
  extraContext:any
  formRef:FormRef
  showFormParsingErrors: BasicFun<FormParsingResult, JSX.Element>
} & FormsParserState
export type FormRunnerState = {
  form:Sum<{ form:any, formState:any, mapping:Mapping<any,any> }, "not initialized">
}
export type FormRunnerForeignMutationsExpected = Unit
export const FormRunnerState = {
  Default:():FormRunnerState => ({
    form:Sum.Default.right("not initialized"),
  }),
  Updaters:{
    ...simpleUpdater<FormRunnerState>()("form"),
  }
}
