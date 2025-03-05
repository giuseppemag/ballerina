import { List } from "immutable";
import { BasicFun, BasicUpdater, FormFieldPredicateEvaluation, replaceWith, SimpleCallback, Sum, Updater, ValidateRunner, Value } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange } from "../../../singleton/state";
import { SumFieldState, SumFieldView } from "./state";

export type StateWithDefault<S> = { Default: () => S };

export const SumForm = <
  L, 
  R,
  LeftFormState,
  RightFormState,
  Context extends FormLabel & {
    elementVisibilities: {
      left: FormFieldPredicateEvaluation,
      right: FormFieldPredicateEvaluation
    },
    elementDisabled: {
      left: FormFieldPredicateEvaluation,
      right: FormFieldPredicateEvaluation
    }
  },
  ForeignMutationsExpected
>(
  LeftFormState: StateWithDefault<LeftFormState>,
  RightFormState: StateWithDefault<RightFormState>,
  Left: StateWithDefault<L>,
  Right: StateWithDefault<R>,
  leftTemplate: Template<
    Context & Value<L> & LeftFormState,
    LeftFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<L>;
    }
  >,
  rightTemplate: Template<
    Context & Value<R> & RightFormState,
    RightFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<R>;
    }
  >,
  validation?: BasicFun<Sum<L, R>, Promise<FieldValidation>>,
) => {
  const embeddedLeftTemplate = () =>
    leftTemplate
      .mapForeignMutationsFromProps<ForeignMutationsExpected & {
        onChange: OnChange<Sum<L, R>>;
      }>((props): ForeignMutationsExpected & {
        onChange: OnChange<L>;
      } =>
        ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(Updater((sum: Sum<L, R>) => sum === undefined ? sum : Sum.Updaters.left<L, R>(elementUpdater)(sum)), path)
            props.setState(_ => ({ ..._, modifiedByUser: true }))
          },
        })
      )
      .mapContext((_: Context & Value<Sum<L, R>> & SumFieldState<L, R, LeftFormState, RightFormState>): (Context & Value<L> & LeftFormState) | undefined => {
        if (_.value.kind !== 'l' || _.sumFormState.kind !== 'l') {
          return undefined;
        }
        const leftFormState = _.sumFormState.value || LeftFormState.Default();
        const leftContext: Context & Value<L> & LeftFormState = ({
          ..._,
          ...leftFormState,
          value: _.value.value,
          visibilities: _.elementVisibilities.left,
          disabledFields: _.elementDisabled.left
        });
        return leftContext;
      })
      .mapState((_: BasicUpdater<LeftFormState>): Updater<SumFieldState<L, R, LeftFormState, RightFormState>> =>
        SumFieldState<L, R, LeftFormState, RightFormState>().Updaters.Core.sumFormState(
          Sum.Updaters.left(_)
        )
      );
  const embeddedRightTemplate = () =>
    rightTemplate
      .mapForeignMutationsFromProps<ForeignMutationsExpected & {
        onChange: OnChange<Sum<L, R>>;
      }>((props): ForeignMutationsExpected & {
        onChange: OnChange<R>;
      } =>
        ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(Updater((sum: Sum<L, R>) => sum === undefined ? sum : Sum.Updaters.right<L, R>(elementUpdater)(sum)), path)
            props.setState(_ => ({ ..._, modifiedByUser: true }))
          },
        })
      )
      .mapContext((_: Context & Value<Sum<L, R>> & SumFieldState<L, R, LeftFormState, RightFormState>): (Context & Value<R> & RightFormState) | undefined => {
        if (_.value.kind !== 'r' || _.sumFormState.kind !== 'r') {
          return undefined;
        }
        const rightFormState = _.sumFormState.value || RightFormState.Default();
        const rightContext: Context & Value<R> & RightFormState = ({
          ..._,
          ...rightFormState,
          value: _.value.value,
          visibilities: _.elementVisibilities.right,
          disabledFields: _.elementDisabled.right
        });
        return rightContext;
      })
      .mapState((_: BasicUpdater<RightFormState>): Updater<SumFieldState<L, R, LeftFormState, RightFormState>> =>
        SumFieldState<L, R, LeftFormState, RightFormState>().Updaters.Core.sumFormState(
          Sum.Updaters.right(_)
        )
      );
    return Template.Default<
      Context & Value<Sum<L, R>> & { disabled: boolean },
      SumFieldState<L, R, LeftFormState, RightFormState>,
      ForeignMutationsExpected & { onChange: OnChange<Sum<L, R>>; },
      SumFieldView<L, R, LeftFormState, RightFormState, Context, ForeignMutationsExpected>
    >(props => <>
      <props.view
        {...props}
        context={{...props.context}}
        foreignMutations={{
          ...props.foreignMutations,
          switch: (_) => {
            props.foreignMutations.onChange(
              replaceWith(
                _.kind === 'l' ? Sum.Default.left(_.value) : Sum.Default.right(_.value)
              ), List()
            )
          }
        }}
        embeddedLeftTemplate={embeddedLeftTemplate}
        embeddedRightTemplate={embeddedRightTemplate}
      />
    </>
    ).any([
      ValidateRunner<Context & { disabled: boolean }, SumFieldState<L, R, LeftFormState, RightFormState>, ForeignMutationsExpected, Sum<L, R>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
    ])
      
};