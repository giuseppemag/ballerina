import { AsyncState, builtInsFromFieldViews, injectablesFromFieldViews, Synchronize, Unit } from "../../../../../../../main"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import { IntegratedFormsConfig } from "../../validator/state"
import { IntegratedFormParsingResult, IntegratedFormsParserContext, IntegratedFormsParserState, parseIntegratedFormsToLaunchers } from "../state"
export const LoadValidateAndParseIntegratedFormsConfig = <T extends {[key in keyof T] : {type: any, state: any}}>() => {
  const Co = CoTypedFactory<IntegratedFormsParserContext<T>, IntegratedFormsParserState>()

 return Co.Template<Unit>(
  Co.GetState().then(current => 
  Synchronize<Unit, IntegratedFormParsingResult>(async() => {
    const rawFormsConfig = await current.getFormsConfig();
    const builtIns = builtInsFromFieldViews(current.fieldViews)
    const injectedPrimitives = current.injectedPrimitives ? injectablesFromFieldViews(current.fieldViews, current.injectedPrimitives) : undefined
    return IntegratedFormsConfig.Default.validateAndParseIntegratedFormConfig(builtIns, current.fieldTypeConverters, injectedPrimitives)(rawFormsConfig).Then(
        validationResult =>
            parseIntegratedFormsToLaunchers(
                builtIns,
                injectedPrimitives,
                current.fieldTypeConverters,
                current.containerFormView,
                current.nestedContainerFormView,
                current.fieldViews,
                current.infiniteStreamSources,
                current.enumOptionsSources,
                )(validationResult) 
    )
  }, _ => "transient failure", 5, 50)
    .embed(
      _ => _.formsConfig,
      IntegratedFormsParserState.Updaters.formsConfig
    )
  ),
  {
    interval:15,
    runFilter:props => !AsyncState.Operations.hasValue(props.context.formsConfig.sync)
  }
 )
}