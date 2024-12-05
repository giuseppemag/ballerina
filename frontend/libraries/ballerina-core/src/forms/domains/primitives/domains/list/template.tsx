import { List } from "immutable";
import { SimpleCallback, BasicFun, Unit, ValidateRunner, Updater, BasicUpdater, MapRepo, ListRepo } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange } from "../../../singleton/state";
import { ListFieldState, ListFieldView } from "./state";

export const ListForm = <Element, ElementFormState, Context extends FormLabel, ForeignMutationsExpected>(
  ElementFormState: { Default: () => ElementFormState },
  Element: { Default: () => Element },
  elementTemplate: Template<
    Context & Value<Element> & ElementFormState,
    ElementFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<Element>;
    }>,
  validation?: BasicFun<List<Element>, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplate = (elementIndex:number) =>
      elementTemplate
        .mapForeignMutations((_ : ForeignMutationsExpected & {
            onChange: OnChange<List<Element>>;
            add: SimpleCallback<Unit>;
            remove: SimpleCallback<number>;
          }) : ForeignMutationsExpected & {
            onChange: OnChange<Element>;
          } => ({
          ..._,
          onChange: (elementUpdater, path) => {
            _.onChange(Updater((elements:List<Element>) => elements.update(elementIndex, (_:Element | undefined) => _ == undefined ? _ : elementUpdater(_))), path)
          },
          add: (newElement: Element) => { },
          remove: (elementIndex: number) => { }
        }))
        .mapContext((_: Context & Value<List<Element>> & ListFieldState<Element, ElementFormState>) : (Context & Value<Element> & ElementFormState) | undefined => {
          const element = _.value.get(elementIndex)
          if (element == undefined) return undefined
          const elementFormState = _.elementFormStates.get(elementIndex) || ElementFormState.Default()
          const elementContext : Context & Value<Element> & ElementFormState = ({ ..._, ...elementFormState, value: element })
          return elementContext
        })
        .mapState((_:BasicUpdater<ElementFormState>) : Updater<ListFieldState<Element, ElementFormState>> => 
          ListFieldState<Element, ElementFormState>().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(elementIndex, () => ElementFormState.Default(),  _)
          ))
  return Template.Default<Context & Value<List<Element>> & { disabled: boolean }, ListFieldState<Element, ElementFormState>, ForeignMutationsExpected & { onChange: OnChange<List<Element>>; },
    ListFieldView<Element, ElementFormState, Context, ForeignMutationsExpected>>(props => <>
      <props.view {...props}
        context={{
          ...props.context,
        }}
        foreignMutations={{
          ...props.foreignMutations,
          add: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.push(Element.Default()), List()
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
      ValidateRunner<Context & { disabled: boolean }, ListFieldState<Element, ElementFormState>, ForeignMutationsExpected, List<Element>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
    ]);
};
