import { Map } from "immutable"

import { FormFieldPredicateEvaluation, simpleUpdater, unit, Unit, BasicFun, Synchronized, Template, Injectables, PredicateValue, fromAPIRawValue, toAPIRawValue, ValueOrErrors, Debounced } from "../../../../../../main"
import { EnumOptionsSources, InfiniteStreamSources, ParseForms } from "../../../parser/state"
import { BuiltIns } from "../../../../../../main";
import { ApiConverters, InjectedPrimitives } from "../../../../../../main";
import { ParsedIntegratedFormJSON } from "../validator/state";
import { IntegratedFormContext, IntegratedFormForeignMutationsExpected, IntegratedFormState } from "../launcher/domains/integrated-form/state";
import { IntegratedFormTemplate } from "../launcher/domains/integrated-form/template";
import { LoadValidateAndParseIntegratedFormsConfig } from "./coroutines/runner";

export const IntegratedFormsParserTemplate = <T extends {[key in keyof T] : {type: any, state: any}} = Unit>() => LoadValidateAndParseIntegratedFormsConfig<T>()


export type IntegratedForm = <Entity, FormState, ExtraContext>() =>
    {
      form:
      Template<IntegratedLauncherContext<Entity, FormState, ExtraContext> & IntegratedFormState<Entity, FormState>,
        IntegratedFormState<Entity, FormState>, IntegratedFormForeignMutationsExpected<Entity, FormState>>,
      initialState: IntegratedFormState<Entity, FormState>
    }

export type ParsedIntegratedLaunchers = Map<string, <Entity, FormState, ExtraContext>() =>
    {
      form:
      Template<IntegratedLauncherContext<Entity, FormState, ExtraContext> & IntegratedFormState<Entity, FormState>,
        IntegratedFormState<Entity, FormState>, IntegratedFormForeignMutationsExpected<Entity, FormState>>,
      initialState: IntegratedFormState<Entity, FormState>
    }>

export type IntegratedLauncherContext<Entity, FormState, ExtraContext> =
    Omit<
        IntegratedFormContext<Entity, FormState> &
        IntegratedFormState<Entity, FormState> & {
        extraContext: ExtraContext,
        containerFormView: any,
        containerWrapper: any
        }, "api" | "actualForm">

export type IntegratedFormParsingResult = ValueOrErrors<ParsedIntegratedLaunchers, string>

export const parseIntegratedFormsToLaunchers =
<T extends { [key in keyof T]: { type: any; state: any; }; },>(
    builtIns: BuiltIns,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
    apiConverters: ApiConverters<T>,
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    ) =>
    (formsConfig: ParsedIntegratedFormJSON<T>):
    IntegratedFormParsingResult => {

    return ParseForms(
        builtIns,
        injectedPrimitives,
        nestedContainerFormView,
        fieldViews,
        infiniteStreamSources,
        enumOptionsSources,
    )(formsConfig).Then(parsedForms => {
        let parsedLaunchers: ParsedIntegratedLaunchers = Map()
        formsConfig.launchers.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const globalConfigurationType = formsConfig.types.get(formsConfig.apis.globalConfigType)!
        const initialState = parsedForm.initialFormState
        const formType = parsedForm.formDef.type;
        const visibilityPredicateExpressions = parsedForm.visibilityPredicateExpressions
        const disabledPredicatedExpressions = parsedForm.disabledPredicatedExpressions
        parsedLaunchers = parsedLaunchers.set(
            launcherName,
            <Entity, FormState, ExtraContext, Context extends IntegratedLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: IntegratedFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
                ({
                rawEntity: parentContext.rawEntity,
                rawGlobalConfiguration: parentContext.rawGlobalConfiguration,
                commonFormState: parentContext.commonFormState,
                customFormState: parentContext.customFormState,
                formFieldStates: parentContext.formFieldStates,
                extraContext: parentContext.extraContext,
                visibilityPredicateExpressions,
                disabledPredicatedExpressions,
                types: formsConfig.types,
                formType: formType,
                isInitialized: parentContext.customFormState.isInitialized,
                parseGlobalConfiguration: (raw: any) => PredicateValue.Operations.parse(raw, globalConfigurationType, formsConfig.types),
                fromApiParser: (value: any) => fromAPIRawValue(formType, formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value),
                toApiParser: (value: any, formState: any, checkKeys: boolean) => toAPIRawValue(formType , formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value, formState, checkKeys),
                actualForm: form.withView(containerFormView).mapContext((_: any) => ({
                    value: _.value,
                    toApiParser: parentContext.toApiParser,
                    fromApiParser: parentContext.fromApiParser,
                    parseGlobalConfiguration: parentContext.parseGlobalConfiguration,
                    formFieldStates: parentContext.formFieldStates,
                    rootValue: _.value,
                    extraContext: parentContext.extraContext,
                    commonFormState: parentContext.commonFormState,
                    predicateEvaluations: parentContext.customFormState.predicateEvaluations,
                    visibilities: _.visibilities,
                    disabledFields: _.disabledFields,
                    }))
                }) as any)
                .withViewFromProps(props => props.context.containerWrapper)
                .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: IntegratedFormState<Entity, FormState>().Default(initialState.formFieldStates, initialState.commonFormState)
            })
        )
        })
        return ValueOrErrors.Default.return(parsedLaunchers)
    })
    
    }

export type IntegratedFormsParserContext<T extends {[key in keyof T] : {type: any, state: any}}> = {
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    fieldTypeConverters: ApiConverters<T>,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    injectedPrimitives?: Injectables<T>,
    formsConfig: any,
    getFormsConfig: BasicFun<void, Promise<any>>
}
    
export type IntegratedFormsParserState = {
    formsConfig: Synchronized<Unit, IntegratedFormParsingResult>
}
export const IntegratedFormsParserState = {
Default: (): IntegratedFormsParserState => ({
    formsConfig: Synchronized.Default(unit)
}),
Updaters: {
    ...simpleUpdater<IntegratedFormsParserState>()("formsConfig")
}
}
