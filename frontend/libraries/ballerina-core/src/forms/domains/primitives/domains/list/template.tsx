import { List } from "immutable";
import { SimpleCallback, BasicFun, Unit, ValidateRunner, Updater, BasicUpdater, MapRepo, ListRepo, CoTypedFactory, Debounce, Synchronize} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, CommonFormState } from "../../../singleton/state";
import { ListFieldState, ListFieldView } from "./state";

export const ListForm = <Element, ElementFormState, Context extends FormLabel, ForeignMutationsExpected>(
  ElementFormState: { Default: () => ElementFormState },
  Element: { Default: () => Element  | undefined},
  elementTemplate: Template<
    Context & Value<Element | undefined> & ElementFormState,
    ElementFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<Element | undefined>;
    }>,
  validation?: BasicFun<List<Element | undefined>, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplate = (elementIndex:number) =>
      elementTemplate
        .mapForeignMutationsFromProps<ForeignMutationsExpected & {
          onChange: OnChange<List<Element| undefined>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;}>((props): ForeignMutationsExpected & {onChange: OnChange<Element | undefined>} => ({
        ...props.foreignMutations,
        onChange: (elementUpdater, path) => {
          props.foreignMutations.onChange(Updater((elements:List<Element | undefined>) =>
            elements.has(elementIndex) ? elements.update(elementIndex, undefined, elementUpdater) : elements), path)
          props.setState(_ => ({..._,
             modifiedByUser:true,
            })) },
        add: (newElement: Element) => { },
        remove: (elementIndex: number) => { }
      }))
        .mapContext((_: Context & Value<List<Element | undefined>> & ListFieldState<Element | undefined, ElementFormState>) : (Context & Value<Element | undefined> & ElementFormState) | undefined => {
          if(!_.value.has(elementIndex)) return undefined
          const element = _.value.get(elementIndex)
          const elementFormState = _.elementFormStates.get(elementIndex) || ElementFormState.Default()
          const elementContext : Context & Value<Element | undefined> & ElementFormState = ({ ..._, ...elementFormState, value: element })
          return elementContext
        })
        .mapState((_:BasicUpdater<ElementFormState>) : Updater<ListFieldState<Element | undefined, ElementFormState>> => 
          ListFieldState<Element | undefined, ElementFormState>().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(elementIndex, () => ElementFormState.Default(),  _)
          ))
  return Template.Default<Context & Value<List<Element | undefined>> & { disabled: boolean }, ListFieldState<Element | undefined, ElementFormState>, ForeignMutationsExpected & { onChange: OnChange<List<Element | undefined>>; },
    ListFieldView<Element | undefined, ElementFormState, Context, ForeignMutationsExpected>>(props => <>
      <props.view {...props}
        context={{
          ...props.context,
        }}
        foreignMutations={{
          ...props.foreignMutations,
          add: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.push<Element | undefined>(Element.Default()), List()
            )            
          },
          remove: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.remove(_), List()
            )            
          }
        }}
        embeddedElementTemplate={embeddedElementTemplate}
      />
    </>
    ).any([
      ValidateRunner<Context & { disabled: boolean }, ListFieldState<Element | undefined, ElementFormState>, ForeignMutationsExpected, List<Element | undefined>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
    ]);
};
