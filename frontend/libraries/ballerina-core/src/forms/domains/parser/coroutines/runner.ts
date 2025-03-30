import {
  AsyncState,
  builtInsFromFieldViews,
  injectablesFromFieldViews,
  Sum,
  Synchronize,
  Unit,
  Specification,
} from "../../../../../main";
import { CoTypedFactory } from "../../../../coroutines/builder";
import {
  FormLaunchersResult,
  FormsParserContext,
  FormsParserState,
  parseFormsToLaunchers,
} from "../state";

export const LoadValidateAndParseFormsConfig = <
  T extends { [key in keyof T]: { type: any; state: any } },
>() => {
  const Co = CoTypedFactory<FormsParserContext<T>, FormsParserState<T>>();

  return Co.Template<Unit>(
    Co.GetState().then((current) =>
      Synchronize<Unit, FormLaunchersResult<T>>(
        async () => {
          const serializedSpecifications = await current.getFormsConfig();
          const builtIns = builtInsFromFieldViews(current.fieldViews);
          const injectedPrimitives = current.injectedPrimitives
            ? injectablesFromFieldViews(
                current.fieldViews,
                current.injectedPrimitives,
              )
            : undefined;
          const deserializationResult =
            Specification.Operations.Deserialize(
              current.fieldTypeConverters,
              injectedPrimitives,
            )(serializedSpecifications);
          if (deserializationResult.kind == "errors")
            return deserializationResult
          const dispatcherContext = {
            builtIns,
            injectedPrimitives,
            fieldTypeConverters: current.fieldTypeConverters,
            containerFormView: current.containerFormView,
            nestedContainerFormView: current.nestedContainerFormView,
            fieldViews: current.fieldViews,
            infiniteStreamSources: current.infiniteStreamSources,
            enumOptionsSources: current.enumOptionsSources,
          }
          return parseFormsToLaunchers(
            builtIns,
            injectedPrimitives,
            current.fieldTypeConverters,
            current.containerFormView,
            current.nestedContainerFormView,
            current.fieldViews,
            current.infiniteStreamSources,
            current.enumOptionsSources,
            current.entityApis,
          )(deserializationResult.value);
        },
        (_) => "transient failure",
        5,
        50,
      ).embed((_) => _.formsConfig, FormsParserState<T>().Updaters.formsConfig),
    ),
    {
      interval: 15,
      runFilter: (props) =>
        !AsyncState.Operations.hasValue(props.context.formsConfig.sync),
    },
  );
};
