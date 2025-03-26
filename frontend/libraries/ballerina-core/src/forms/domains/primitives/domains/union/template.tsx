import React, { Context } from "react";
import {
  BasicFun,
  BasicUpdater,
  PredicateValue,
  Updater,
  ValidateRunner,
  Value,
  ValueRecord,
  ValueUnionCase,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
    CommonFormState,
  EntityFormContext,
  EntityFormForeignMutationsExpected,
  EntityFormState,
  EntityFormTemplate,
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { UnionFormState, UnionFormView } from "./state";
import { Map, Set } from "immutable";

export const UnionForm = <
  Context extends FormLabel & { caseNames: Set<string> },
  ForeignMutationsExpected,
  CaseFormStates extends Map<string, EntityFormState<any, any, any, any>>,
>(
  caseTemplates: Map<string, EntityFormTemplate<any, any, any, any>>,

  validation?: BasicFun<ValueUnionCase, Promise<FieldValidation>>,
) => {
  const caseNames = caseTemplates.keySeq().toSet();
  const embeddedCaseTemplate = (caseName: string) =>
    caseTemplates
      .get(caseName)!
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >(
        (props): ForeignMutationsExpected & { onChange: OnChange<PredicateValue> } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater: any, path: any) => {
            props.foreignMutations.onChange(
              (_) => ({
                ..._,
                fields: elementUpdater(_.fields),
              }),
              path,
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueUnionCase> &
            UnionFormState<CaseFormStates>,
        ): Context & Value<ValueUnionCase> & { caseNames: Set<string> } => {
          const context: Context & Value<ValueUnionCase> & { caseNames: Set<string> } = {
            ..._,
            ..._.customFormState.caseStates.get(caseName),
            caseNames,
            value: _.value.fields,
            commonFormState: {
              modifiedByUser: true,
            },
          };
          return context;
        },
      )
      .mapState(
        (
          _: BasicUpdater<{ formFieldStates: any; commonFormState: CommonFormState }>,
        ): Updater<UnionFormState<CaseFormStates>> =>
          UnionFormState<CaseFormStates>().Updaters.Core.customFormState(
            (__) => ({
              ...__,
              caseStates: __.caseStates.update(caseName, (state) =>
                _(state as EntityFormState<any, any, any, any>),
              ),
            }),
          ),
      );
  return Template.Default<
    Context & Value<ValueUnionCase>,
    UnionFormState<CaseFormStates>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueUnionCase>;
    },
    UnionFormView<
      CaseFormStates,
      Context & { caseNames: Set<string> },
      ForeignMutationsExpected
    >
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          context={{ ...props.context, caseNames }}
          foreignMutations={{
            ...props.foreignMutations,
          }}
          embeddedCaseTemplate={embeddedCaseTemplate}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context,
      UnionFormState<CaseFormStates>,
      ForeignMutationsExpected,
      ValueUnionCase
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
  ]);
};
