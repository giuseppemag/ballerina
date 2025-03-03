import { List } from "immutable";
import {
  SimpleCallback,
  BasicFun,
  Unit,
  ValidateRunner,
  Updater,
  BasicUpdater,
  MapRepo,
  ListRepo,
  CoTypedFactory,
  Debounce,
  Synchronize,
  FormFieldPredicateEvaluation,
  replaceWith,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  FormValidatorSynchronized,
  OnChange,
  CommonFormState,
} from "../../../singleton/state";
import { ListFieldState, ListFieldView } from "./state";

export const ListForm = <
  Element,
  ElementFormState,
  Context extends FormLabel & {
    elementVisibilities: FormFieldPredicateEvaluation[];
    elementDisabled: FormFieldPredicateEvaluation[];
  },
  ForeignMutationsExpected,
>(
  ElementFormState: { Default: () => ElementFormState },
  Element: { Default: () => Element | undefined },
  elementTemplate: Template<
    Context & Value<Element | undefined> & ElementFormState,
    ElementFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<Element | undefined>;
    }
  >,
  validation?: BasicFun<List<Element | undefined>, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplate = (elementIndex: number) =>
    elementTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<List<Element | undefined>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
          move: (elementIndex: number, to: number) => void;
          duplicate: SimpleCallback<number>;
          insert: SimpleCallback<number>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<Element | undefined>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              Updater((elements: List<Element | undefined>) =>
                elements.has(elementIndex)
                  ? elements.update(elementIndex, undefined, elementUpdater)
                  : elements,
              ),
              List([elementIndex]).concat(path),
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
          add: () => {},
          remove: (elementIndex: number) => {},
          move: (elementIndex: number, to: number) => {},
          duplicate: (elementIndex: number) => {},
          insert: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<List<Element | undefined>> &
            ListFieldState<Element | undefined, ElementFormState>,
        ):
          | (Context & Value<Element | undefined> & ElementFormState)
          | undefined => {
          if (!_.value.has(elementIndex)) return undefined;
          const element = _.value.get(elementIndex);
          const elementFormState =
            _.elementFormStates.get(elementIndex) || ElementFormState.Default();
          const elementVisibility = _.elementVisibilities[elementIndex];
          const elementDisabled = _.elementDisabled[elementIndex];
          const elementContext: Context &
            Value<Element | undefined> &
            ElementFormState = {
            ..._,
            ...elementFormState,
            value: element,
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        },
      )
      .mapState(
        (
          _: BasicUpdater<ElementFormState>,
        ): Updater<ListFieldState<Element | undefined, ElementFormState>> =>
          ListFieldState<
            Element | undefined,
            ElementFormState
          >().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementIndex,
              () => ElementFormState.Default(),
              _,
            ),
          ),
      );
  return Template.Default<
    Context & Value<List<Element | undefined>> & { disabled: boolean },
    ListFieldState<Element | undefined, ElementFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<List<Element | undefined>>;
    },
    ListFieldView<
      Element | undefined,
      ElementFormState,
      Context,
      ForeignMutationsExpected
    >
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          context={{
            ...props.context,
          }}
          foreignMutations={{
            ...props.foreignMutations,
            add: (_) => {
              props.foreignMutations.onChange(
                ListRepo.Updaters.push<Element | undefined>(Element.Default()),
                List([{ kind: "add" }]),
              );
            },
            remove: (_) => {
              props.foreignMutations.onChange(
                ListRepo.Updaters.remove(_),
                List([_, { kind: "remove" }]),
              );
            },
            move: (index, to) => {
              props.foreignMutations.onChange(
                ListRepo.Updaters.move(index, to),
                List([index, { kind: "move", to }]),
              );
            },
            duplicate: (_) => {
              props.foreignMutations.onChange(
                ListRepo.Updaters.duplicate(_),
                List([_, { kind: "duplicate" }]),
              );
            },
            insert: (_) => {
              props.foreignMutations.onChange(
                ListRepo.Updaters.insert(_, Element.Default()),
                List([_, { kind: "insert" }]),
              );
            },
          }}
          embeddedElementTemplate={embeddedElementTemplate}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      ListFieldState<Element | undefined, ElementFormState>,
      ForeignMutationsExpected,
      List<Element | undefined>
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
