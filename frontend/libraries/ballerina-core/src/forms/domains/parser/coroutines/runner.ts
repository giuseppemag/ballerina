import { AsyncState, builtInsFromFieldViews, FormsConfig, injectablesFromFieldViews, Sum, Synchronize, Unit } from "../../../../../main"
import { CoTypedFactory } from "../../../../coroutines/builder"
import { FormParsingResult, FormsParserContext, FormsParserState, parseForms, replaceKeywords } from "../state"

export const LoadValidateAndParseFormsConfig = () => {
  const Co = CoTypedFactory<FormsParserContext, FormsParserState>()

 return Co.Template<Unit>(
  Co.GetState().then(current => 
  Synchronize<Unit, FormParsingResult>(async() => {
    const rawFormsConfig = await current.getFormsConfig();
    const formsConfig = replaceKeywords(rawFormsConfig, "from api")
    const builtIns = builtInsFromFieldViews(current.fieldViews)
    const injectedPrimitives = current.injectedPrimitives ? injectablesFromFieldViews(current.fieldViews, current.injectedPrimitives) : undefined
    const validationResult = FormsConfig.Default.validateAndParseAPIResponse(builtIns, injectedPrimitives)(formsConfig)
    if (validationResult.kind == "r")
      return Sum.Default.right(validationResult.value)
    return parseForms(
      builtIns,
      injectedPrimitives,
      current.fieldTypeConverters,
      current.containerFormView,
      current.nestedContainerFormView,
      current.fieldViews,
      current.infiniteStreamSources,
      current.enumOptionsSources,
      current.entityApis,
      current.leafPredicates,)(validationResult.value)
  }, _ => "transient failure", 5, 50)
    .embed(
      _ => _.formsConfig,
      FormsParserState.Updaters.formsConfig
    )
  ),
  {
    interval:15,
    runFilter:props => !AsyncState.Operations.hasValue(props.context.formsConfig.sync)
  }
 )
}