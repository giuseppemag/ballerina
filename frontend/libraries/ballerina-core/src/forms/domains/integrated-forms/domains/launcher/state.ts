import { List } from "immutable"
import { PredicateValue, Sum, Unit, ValueOrErrors, simpleUpdater } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"
import { IntegratedFormParsingResult, IntegratedFormsParserState } from "../parser/state"

export type IntegratedFormRef = {
    formName:string
  } 

export type IntegratedFormRunnerContext<E> = {
    extraContext:any,
    initialRawEntity: Sum<any, "not initialized">,
    entity: Sum<E, "not initialized">,
    globalConfiguration: Sum<PredicateValue, "not initialized">,
    containerWrapper: any,
    formRef:IntegratedFormRef,
    showFormParsingErrors: BasicFun<IntegratedFormParsingResult, JSX.Element>
} & IntegratedFormsParserState

export type IntegratedForm<E> = { form:any, formFieldStates:any, commonFormState:any, customFormState:any, fromApiParser: (value: any) => E, toApiParser: (value: E, formState: any, checkKeys: boolean) => ValueOrErrors<any, string>, parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, string> }

export type IntegratedFormRunnerState<E> = {
    form: Sum<IntegratedForm<E>, "not initialized">,
    shouldUpdate: boolean
}
export type IntegratedFormRunnerForeignMutationsExpected = {
    onRawEntityChange: (updatedRawEntity: any, path: List<string>) => void
}
export const IntegratedFormRunnerState = <E,>() => ({
    Default:(): IntegratedFormRunnerState<E> => ({
        form: Sum.Default.right("not initialized"),
        shouldUpdate: false
    }),
    Updaters:{
        ...simpleUpdater<IntegratedFormRunnerState<E>>()("form"),
        ...simpleUpdater<IntegratedFormRunnerState<E>>()("shouldUpdate"),
    }
})
