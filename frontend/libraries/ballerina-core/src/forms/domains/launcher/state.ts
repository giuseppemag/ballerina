import { BasicFun, Guid, Mapping, simpleUpdater, Sum, Unit } from "../../../../main"
import { FormParsingResult, FormsParserState } from "../parser/state"
import { OnChange } from "../singleton/state"

type ApiHandlers = {
  success?: (_: any) => void,
  error?: (_: any) => void,
}

export type FormRef = {
  formName:string
} & ({
  kind:"edit",
  entityId:Guid,
  debounceRateMs?:number
  apiHandlers?: ApiHandlers
} | {
  kind:"map",
  onChange:OnChange<any>
  value:any
} | {
  kind:"create",
  onSubmitted: (_: any) => void,
  submitButtonWrapper:any,
  apiHandlers?: ApiHandlers,
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
