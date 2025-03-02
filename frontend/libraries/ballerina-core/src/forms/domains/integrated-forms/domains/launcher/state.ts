import { List } from "immutable"
import { FormParsingResult, FormsParserState, PredicateValue, Sum, Unit, ValueOrErrors, simpleUpdater } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"

export type PassthroughFormRef = {
    formName:string
  } 

export type PassthroughFormRunnerContext<E> = {
    extraContext:any,
    initialRawEntity: Sum<any, "not initialized">,
    entity: Sum<E, "not initialized">,
    globalConfiguration: Sum<PredicateValue, "not initialized">,
    containerWrapper: any,
    formRef:PassthroughFormRef,
    showFormParsingErrors: BasicFun<FormParsingResult, JSX.Element>
} & FormsParserState

export type PassthroughForm<E> = { form:any, formFieldStates:any, commonFormState:any, customFormState:any, fromApiParser: (value: any) => E, toApiParser: (value: E, formState: any, checkKeys: boolean) => ValueOrErrors<any, string>, parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, string> }

export type PassthroughFormRunnerState<E> = {
    form: Sum<PassthroughForm<E>, "not initialized">,
    shouldUpdate: boolean
}
export type PassthroughFormRunnerForeignMutationsExpected = {
    onRawEntityChange: (updatedRawEntity: any, path: List<string>) => void
}
export const PassthroughFormRunnerState = <E,>() => ({
    Default:(): PassthroughFormRunnerState<E> => ({
        form: Sum.Default.right("not initialized"),
        shouldUpdate: false
    }),
    Updaters:{
        ...simpleUpdater<PassthroughFormRunnerState<E>>()("form"),
        ...simpleUpdater<PassthroughFormRunnerState<E>>()("shouldUpdate"),
    }
})
