import React, { Context } from "react";
import {
  BasicFun,
  BasicUpdater,
  PredicateValue,
  Updater,
  Value,
  ValueUnionCase,
} from "../../../../../../../../main";
import { Template } from "../../../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  CommonFormState,
  EntityFormState,
  EntityFormTemplate,
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { UnionFormState, UnionFormView } from "./state";
import { Map, Set } from "immutable";
import { ValidateRunner } from "../../../singleton/template";

export const UnionForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  //TODO: Use state and values
  defaultState: { Default: () => any },
  defaultValues: { Default: () => PredicateValue },
  caseTemplate: EntityFormTemplate<any, any, any, any>,
  validation?: BasicFun<ValueUnionCase, Promise<FieldValidation>>,
) => {
  const embeddedCaseTemplate = (caseName: string) =>
    caseTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
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
          _: Context & Value<ValueUnionCase> & UnionFormState,
        ): Context & Value<ValueUnionCase> & { caseNames: Set<string> } => {
          const context: Context &
            Value<ValueUnionCase> & { caseNames: Set<string> } = {
            ..._,
            ..._.customFormState.caseState,
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
          _: BasicUpdater<{
            formFieldStates: any;
            commonFormState: CommonFormState;
          }>,
        ): Updater<UnionFormState> =>
          UnionFormState().Updaters.Core.customFormState((__) => ({
            ...__,
            caseState: _(__.caseState),
          })),
      );
  return Template.Default<
    Context & Value<ValueUnionCase>,
    UnionFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueUnionCase>;
    },
    UnionFormView<Context, ForeignMutationsExpected>
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          context={props.context}
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
      UnionFormState,
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
