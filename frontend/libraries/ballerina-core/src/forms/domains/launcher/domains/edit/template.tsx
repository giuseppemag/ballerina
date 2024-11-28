import { AsyncState, editFormRunner, replaceWith, unit } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { EditFormContext, EditFormForeignMutationsExpected, EditFormState, EditFormWritableState } from "./state";

export type EditFormTemplate<E, FS> =
  Template<
    EditFormContext<E, FS> & EditFormWritableState<E, FS>,
    EditFormWritableState<E, FS>,
    EditFormForeignMutationsExpected<E, FS>>
export const EditFormTemplate = <E, FS>() : EditFormTemplate<E,FS> =>
  Template.Default<
    EditFormContext<E, FS> & EditFormWritableState<E, FS>,
    EditFormWritableState<E, FS>,
    EditFormForeignMutationsExpected<E, FS>>(props =>
      <>
        {
          !AsyncState.Operations.hasValue(props.context.entity.sync) ? undefined :
            props.context.actualForm({
              context: {
                value: props.context.entity.sync.value.value,
                ...props.context.formState,
              },
              setState: _ => {
                props.setState(
                  EditFormState<E, FS>().Updaters.Core.formState(_)
                )
              },
              foreignMutations: {
                onChange: (e) => {
                  props.setState(EditFormState<E, FS>().Updaters.Template.entity(e))
                }
              },
              view: unit
            })
        }
      </>
    ).any([
      editFormRunner<E, FS>()
    ])
