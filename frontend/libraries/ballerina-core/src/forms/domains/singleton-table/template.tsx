import { Map } from "immutable";
import {
  BasicUpdater,
  id,
  Unit,
  Debounced,
  Synchronized,
  unit,
  replaceWith,
  CoTypedFactory,
  Debounce,
  Synchronize,
  BasicFun,
  FieldValidationWithPath,
  FormValidatorSynchronized,
  OnChange,
  CommonFormState,
  DirtyStatus,
  PredicateValue,
  ValueRecord,
  Delta,
  ParsedType,
  Sum,
  AsyncState,
  TableState,
  MapRepo,
  TableLayout,
  ParsedRecordType,
  ValueInfiniteStreamTemplate,
} from "../../../../main";
import { Template } from "../../../template/state";
import { Value } from "../../../value/state";
import {
  StateChunk,
  ValueInfiniteStreamState,
} from "../../../value-infinite-data-stream/state";
import { TableRunner } from "./coroutines/runner";

export const TableForm = {
  Default: () => ({
    template: (
      config: Record<string, Template<any, any, any, any>>,
      columnHeaders: Map<string, string | undefined>,
      tableType: ParsedRecordType<any>,
      defaultState: (t: ParsedType<any>) => {
        commonFormState: CommonFormState;
        customFormState: object;
      },
      validation?: BasicFun<PredicateValue, Promise<FieldValidationWithPath>>,
    ): Template<any, any, any, any> => {
      const EmbeddedValueInfiniteStreamTemplate =
        ValueInfiniteStreamTemplate.mapContext<any>(
          (_) => _.customFormState.stream,
        ).mapState<any>(
          TableState().Updaters.Core.customFormState.children.stream,
        );
      const cellTemplates: Record<
        string,
        (chunkIndex: number) => (rowId: string) => Template<any, any, any, any>
      > = {};
      const setCellTemplate = (column: string) => {
        const cellType = tableType.fields.get(column)!;
        cellTemplates[column] = (chunkIndex: number) => (rowId: string) =>
          config[column]
            .mapContext<any>((_: any) => {
              // disabled flag is passed in from the wrapping container when mapping over fields

              const rowData = (
                _.customFormState.stream.loadedElements.get(chunkIndex)
                  ?.data as ValueRecord
              ).fields.get(rowId) as ValueRecord;

              const rowState = (
                _.customFormState.stream.chunkStates.get(chunkIndex)
                  ?.state as Record<string, any>
              )?.[rowId];
              // TODO - could use default value here
              const cellData = rowData?.fields?.get(column as string);
              const cellState =
                rowState?.fields?.get(column as string) ??
                defaultState(cellType);

              return {
                rootValue: _.rootValue,
                extraContext: _.extraContext,
                globalConfiguration: _.globalConfiguration,
                disabled: _.disabled,
                value: cellData,
                commonFormState: _.commonFormState,
                customFormState: cellState.customFormState,
                formFieldStates: cellState.formFieldStates,
                elementFormStates: cellState.elementFormStates,
              };
            })
            .mapState<any>((_) => {
              return TableState().Updaters.Core.customFormState.children.stream(
                ValueInfiniteStreamState().Updaters.Core.chunkStates(
                  MapRepo.Updaters.upsert(
                    chunkIndex,
                    () => Map(),
                    MapRepo.Updaters.upsert(
                      rowId,
                      () => StateChunk.Default(defaultState(cellType)),
                      MapRepo.Updaters.update(rowId, (current) => ({
                        ...current,
                        [column]: _(current[column]),
                      })),
                    ),
                  ),
                ),
              );
            })
            .mapForeignMutationsFromProps<any>((props) => ({
              ...props.foreignMutations,
              onChange: (
                _: BasicUpdater<PredicateValue>,
                nestedDelta: Delta,
              ) => {
                const stateUpdater: BasicUpdater<any> = validation
                  ? (_) => ({
                      ..._,
                      commonFormState: {
                        ..._.commonFormState,
                        modifiedByUser: true,
                        validation:
                          Debounced.Updaters.Template.value<FormValidatorSynchronized>(
                            Synchronized.Updaters.value(replaceWith(unit)),
                          )(_.commonFormState.validation),
                      },
                    })
                  : (_) => ({
                      ..._,
                      commonFormState: {
                        ..._.commonFormState,
                        modifiedByUser: true,
                      },
                    });
                setTimeout(() => {
                  props.setState(stateUpdater);
                }, 0);

                const delta: Delta = {
                  kind: "TableValue",
                  id: rowId,
                  nestedDelta: nestedDelta,
                  tableType: props.context.type,
                };

                props.foreignMutations.onChange(id, delta);
              },
            }));
      };
      Object.keys(config).forEach((_) => {
        setCellTemplate(_);
      });
      return Template.Default<any, any, any, any>((props) => {
        const globalConfig: Sum<PredicateValue, "not initialized"> = (() => {
          if (
            props.context.globalConfiguration.kind != "l" &&
            props.context.globalConfiguration.kind != "r"
          ) {
            // global config is in an async state
            if (
              AsyncState.Operations.hasValue(props.context.globalConfiguration)
            ) {
              return Sum.Default.left<PredicateValue, "not initialized">(
                props.context.globalConfiguration.value,
              );
            }
            return Sum.Default.right<PredicateValue, "not initialized">(
              "not initialized",
            );
          }
          return props.context.globalConfiguration as Sum<
            PredicateValue,
            "not initialized"
          >;
        })();

        if (globalConfig.kind == "r") {
          console.error("global configuration is not initialized");
          return <></>;
        }

        const visibleColumns = TableLayout.Operations.CalculateLayout(
          Map([["global", globalConfig.value]]),
          props.context.visibleColumns,
        );
        if (visibleColumns.kind == "errors") {
          console.error(visibleColumns.errors.toJS());
          return <></>;
        }

        // const disabledFieldKeys: OrderedSet<FieldName> = (() => {
        //   if (
        //     props.context.disabledFields == undefined ||
        //     props.context.disabled ||
        //     props.context.disabledFields.kind != "form"
        //   )
        //     return OrderedSet(
        //       Object.keys(props.context.value.fields.toJS() as object),
        //     );

        //   return props.context.disabledFields.fields
        //     .filter((_) => _.value == true)
        //     .keySeq()
        //     .toOrderedSet();
        // })();

        const tableValues = props.context.customFormState?.stream
          ?.loadedElements
          ? ValueInfiniteStreamState().Operations.flatChunksWithIndexes(
              props.context.customFormState?.stream,
            )
          : [];

        if (!props.context.customFormState.isInitialized) {
          return <></>;
        }

        return (
          <>
            <props.view
              {...props}
              context={{
                ...props.context,
              }}
              foreignMutations={{
                ...props.foreignMutations,
                loadMore: () =>
                  props.setState(TableState().Updaters.Template.loadMore()),
              }}
              VisibleColumns={visibleColumns.value.columns}
              // TODO
              // DisabledFieldKeys={disabledFieldKeys}
              EmbeddedCellTemplates={cellTemplates}
              ColumnHeaders={columnHeaders}
              TableValues={tableValues}
            />
          </>
        );
      }).any([
        ValidateRunner<any, any, any, any>(validation),
        TableRunner,
        EmbeddedValueInfiniteStreamTemplate,
      ]);
    },
  }),
};

// TODO: Validate runner and dirty status are also used to ensure to element is initialised, but this should be further debugged with a more correct solution
const ValidateRunner = <
  Context,
  FormState extends { commonFormState: CommonFormState },
  ForeignMutationsExpected,
  Entity extends PredicateValue,
>(
  validation?: BasicFun<Entity, Promise<FieldValidationWithPath>>,
) => {
  const Co = CoTypedFactory<Context & Value<Entity> & FormState, FormState>();
  return Co.Template<ForeignMutationsExpected & { onChange: OnChange<Entity> }>(
    validation
      ? Co.Repeat(
          Debounce<FormValidatorSynchronized, Value<Entity>>(
            Synchronize<Unit, FieldValidationWithPath, Value<Entity>>(
              (_) => (validation ? validation(_.value) : Promise.resolve([])),
              () => "transient failure",
              3,
              50,
            ),
            50,
          ).embed(
            (_) => ({ ..._.commonFormState.validation, value: _.value }),
            (_) => (curr) => ({
              ...curr,
              commonFormState: {
                ...curr.commonFormState,
                validation: _(curr.commonFormState.validation),
              },
            }),
          ),
        )
      : Co.SetState((curr) => ({
          ...curr,
          commonFormState: {
            ...curr.commonFormState,
            validation: Debounced.Updaters.Core.dirty(
              replaceWith<DirtyStatus>("not dirty"),
            ),
          },
        })),
    {
      interval: 15,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(
          props.context.commonFormState.validation,
        ),
    },
  );
};
