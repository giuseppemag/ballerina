import { List, Map } from "immutable";
import {
  BasicUpdater,
  FieldValidationWithPath,
  MapRepo,
  Updater,
  ValidateRunner,
} from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import {
  FormFieldPredicateEvaluation,
  PredicateValue,
  ValueRecord,
  ValueUnionCase,
} from "../../../parser/domains/predicates/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, FieldValidation } from "../../../singleton/state";
import { UnionFieldState, UnionFieldView } from "./state";

export const UnionForm = <
  CaseName extends string,
  ElementFormStates extends Map<
    CaseName,
    { commonFormState: { modifiedByUser: boolean } }
  >,
  Context extends FormLabel & {
    visibilities: FormFieldPredicateEvaluation;
    disabledFields: FormFieldPredicateEvaluation;
  },
  ForeignMutationsExpected,
>(
  ElementFormStates: Map<
    CaseName,
    { Default: () => { commonFormState: { modifiedByUser: boolean } } }
  >,
  elementTemplates: Map<
    CaseName,
    Template<
      Context &
        Value<PredicateValue> & {
          commonFormState: { modifiedByUser: boolean };
        },
      any,
      ForeignMutationsExpected & {
        onChange: OnChange<ValueRecord>;
      }
    >
  >,
  validation?: BasicFun<ValueUnionCase, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplates = (elementCase: CaseName) =>
    elementTemplates
      .get(elementCase)!
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<ValueRecord>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              Updater((union) =>
                union.caseName === elementCase
                  ? PredicateValue.Default.unionCase(
                      elementCase,
                      elementUpdater(union.fields),
                    )
                  : union,
              ),
              List([elementCase]).concat(path),
            );
            props.setState((_) => ({
              ..._,
              commonFormState: { ..._.commonFormState, modifiedByUser: true },
            }));
          },
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueUnionCase> &
            UnionFieldState<CaseName, ElementFormStates>,
        ):
          | (Context &
              Value<ValueUnionCase> & {
                commonFormState: { modifiedByUser: boolean };
              })
          | undefined => {
          if (_.value.caseName !== elementCase) return undefined;
          if (_.visibilities.kind !== "union") return undefined;
          if (_.disabledFields.kind !== "union") return undefined;
          const formState =
            _.elementFormStates.get(elementCase) ||
            ElementFormStates.get(elementCase)!.Default();
          const visibility = _.visibilities.elementValue;
          const disabled = _.disabledFields.elementValue;
          const context: Context &
            Value<ValueUnionCase> & {
              commonFormState: { modifiedByUser: boolean };
            } = {
            ..._,
            ...formState,
            visibilities: visibility,
            disabledFields: disabled,
          };
          return context;
        },
      )
      .mapState(
        (
          _: BasicUpdater<{ commonFormState: { modifiedByUser: boolean } }>,
        ): Updater<UnionFieldState<CaseName, ElementFormStates>> =>
          UnionFieldState<
            CaseName,
            ElementFormStates
          >().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementCase,
              () => ElementFormStates.get(elementCase)!.Default(),
              _,
            ) as unknown as BasicUpdater<ElementFormStates>,
          ),
      );
  return Template.Default<
    Context & Value<ValueUnionCase> & { disabled: boolean },
    UnionFieldState<CaseName, ElementFormStates>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueUnionCase>;
    },
    UnionFieldView<
      CaseName,
      ElementFormStates,
      Context,
      ForeignMutationsExpected
    >
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          embeddedElementTemplates={embeddedElementTemplates}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      UnionFieldState<CaseName, ElementFormStates>,
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
