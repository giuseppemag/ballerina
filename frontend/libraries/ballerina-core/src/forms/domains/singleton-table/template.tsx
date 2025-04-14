import { OrderedSet, Map, OrderedMap } from "immutable";
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
  EntityFormState,
  EntityFormContext,
  EntityFormForeignMutationsExpected,
  EntityFormTemplate,
  EntityFormView,
  FieldTemplates,
  FieldValidationWithPath,
  FormValidatorSynchronized,
  OnChange,
  CommonFormState,
  DirtyStatus,
  FieldName,
  PredicateValue,
  ValueRecord,
  Delta,
  ParsedType,
  Sum,
  AsyncState,
  FormLayout,
  TableState,
  MapRepo,
  Expr,
  TableLayout,
} from "../../../../main";
import { Template } from "../../../template/state";
import { Value } from "../../../value/state";
import React from "react";
import {
  StateChunk,
  ValueChunk,
  ValueInfiniteStreamState,
} from "../../../value-infinite-data-stream/state";

export const TableForm = {
  Default: () => ({
    template: (
      config: Record<string, Template<any, any, any, any>>,
      columnLabels: Map<string, string | undefined>,
      validation?: BasicFun<PredicateValue, Promise<FieldValidationWithPath>>,
    ): Template<any, any, any, any> => {

      const cellTemplates: Record<
        string,
        (chunkIndex: number) => (rowId: string) => Template<any, any, any, any>
      > = {};
      const setCellTemplate = (column: string) => {
        cellTemplates[column] = (chunkIndex: number) => (rowId: string) =>
          config[column]
            .mapContext<any>((_: any) => {
              // disabled flag is passed in from the wrapping container when mapping over fields

              const rowData = (
                _.stream.loadedElements.get(chunkIndex)?.data as ValueRecord
              ).fields.get(rowId) as ValueRecord;
              const rowState = (
                _.stream.loadedElements.get(chunkIndex)?.state as Record<
                  string,
                  any
                >
              )[rowId];
              const cellData = rowData?.fields.get(column as string);
              const cellState = rowState?.fields.get(column as string);

              return {
                rootValue: _.rootValue,
                extraContext: _.extraContext,
                globalConfiguration: _.globalConfiguration,
                disabled: _.disabled,
                value: cellData,
                commonFormState: cellState.commonFormState,
                customFormState: cellState.customFormState,
                formFieldStates: cellState.formFieldStates,
                elementFormStates: cellState.elementFormStates,
              };
            })
            .mapState<any>((_) => {
              return TableState().Updaters.Core.customFormState.children.stream(
                ValueInfiniteStreamState().Updaters.Core.chunkStates(
                  // TODO: this might need to be upsert
                  MapRepo.Updaters.upsert(
                    chunkIndex.toString(),
                    () =>
                      StateChunk.Default({
                        commonFormState: CommonFormState.Default(),
                        customFormState: {},
                      }),
                    StateChunk.Updaters.Core.state((current) => ({
                      ...current,
                      [rowId]: {
                        ...current[rowId],
                        [column]: _(current[rowId][column]),
                      },
                    })),
                  ),
                ),
              );
            });
        // .mapForeignMutationsFromProps<
        //   EntityFormForeignMutationsExpected<
        //     Fields,
        //     FieldStates,
        //     Context,
        //     ForeignMutationsExpected
        //   >
        // >((props) => ({
        //   ...props.foreignMutations,
        //   onChange: (_: BasicUpdater<PredicateValue>, nestedDelta) => {
        //     const stateUpdater: BasicUpdater<
        //       EntityFormState<
        //         Fields,
        //         FieldStates,
        //         Context,
        //         ForeignMutationsExpected
        //       >
        //     > = validation
        //       ? (_) => ({
        //           ..._,
        //           commonFormState: {
        //             ..._.commonFormState,
        //             modifiedByUser: true,
        //             validation:
        //               Debounced.Updaters.Template.value<FormValidatorSynchronized>(
        //                 Synchronized.Updaters.value(replaceWith(unit)),
        //               )(_.commonFormState.validation),
        //           },
        //           formFieldStates: {
        //             ..._.formFieldStates,
        //             [field]: {
        //               ..._.formFieldStates[field],
        //               commonFormState: {
        //                 ..._.formFieldStates[field].commonFormState,
        //                 modifiedByUser: true,
        //                 validation:
        //                   Debounced.Updaters.Template.value<FormValidatorSynchronized>(
        //                     Synchronized.Updaters.value(replaceWith(unit)),
        //                   )(_.commonFormState.validation),
        //               },
        //             },
        //           },
        //         })
        //       : (_) => ({
        //           ..._,
        //           commonFormState: {
        //             ..._.commonFormState,
        //             modifiedByUser: true,
        //           },
        //           formFieldStates: {
        //             ..._.formFieldStates,
        //             [field]: {
        //               ..._.formFieldStates[field],
        //               commonFormState: {
        //                 ..._.formFieldStates[field].commonFormState,
        //                 modifiedByUser: true,
        //               },
        //             },
        //           },
        //         });
        //     setTimeout(() => {
        //       props.setState(stateUpdater);
        //     }, 0);

        //     const delta: Delta = {
        //       kind: "RecordField",
        //       field: [field as string, nestedDelta],
        //       recordType: props.context.type,
        //     };

        //     props.foreignMutations.onChange(
        //       (current: PredicateValue): PredicateValue =>
        //         PredicateValue.Operations.IsRecord(current)
        //           ? PredicateValue.Default.record(
        //               current.fields.update(
        //                 field as string,
        //                 PredicateValue.Default.unit(),
        //                 _,
        //               ),
        //             )
        //           : current,
        //       delta,
        //     );
        //   },
        // }));
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
        console.debug("Table Form", props);

        return (
          <>
            <p>Table Form</p>
            <props.view/>
            {/* <props.view
              {...props}
              context={{
                ...props.context,
              }}
              VisibleColumns={visibleColumns}
              // TODO
              // DisabledFieldKeys={disabledFieldKeys}
              EmbeddedCells={cellTemplates}
              ColumnsLabels={columnLabels}
            /> */}
          </>
        );
      }).any([ValidateRunner<any, any, any, any>(validation)]);
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
