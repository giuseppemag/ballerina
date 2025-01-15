import { AsyncState, createFormRunner, replaceWith, SimpleCallback, unit } from "../../../../../../main";
import { Template, View } from "../../../../../template/state";
import { CreateFormContext, CreateFormForeignMutationsExpected, CreateFormState, CreateFormWritableState } from "./state";

export type CreateFormView<E, FS> =
  Template<
    CreateFormContext<E, FS> & CreateFormWritableState<E, FS>,
    CreateFormWritableState<E, FS>,
    CreateFormForeignMutationsExpected<E, FS> & { onSubmit: SimpleCallback<void> },
    {
      actualForm: JSX.Element | undefined
    }>
export type CreateFormTemplate<E, FS> =
  Template<
    CreateFormContext<E, FS> & CreateFormWritableState<E, FS>,
    CreateFormWritableState<E, FS>,
    CreateFormForeignMutationsExpected<E, FS>,
    CreateFormView<E, FS>>
export const CreateFormTemplate = <E, FS>(): CreateFormTemplate<E, FS> =>
  Template.Default<
    CreateFormContext<E, FS> & CreateFormWritableState<E, FS>,
    CreateFormWritableState<E, FS>,
    CreateFormForeignMutationsExpected<E, FS>,
    CreateFormView<E, FS>>(props => {
      return <>
        {
          props.view({
            ...props, 
            foreignMutations: {
              ...props.foreignMutations, onSubmit: () => {
                props.setState(CreateFormState<E, FS>().Updaters.Template.submit())
              }
            },
            view: {
              ...props.view,
              actualForm:
                !AsyncState.Operations.hasValue(props.context.entity.sync) ? undefined :
                  props.context.actualForm({
                    context: {
                      value: props.context.entity.sync.value,
                      ...props.context.formState,
                    },
                    setState: _ => {
                      props.setState(
                        CreateFormState<E, FS>().Updaters.Core.formState(_)
                      )
                    },
                    foreignMutations: {
                      onChange: (e) => {
                        props.setState(CreateFormState<E, FS>().Updaters.Template.entity(e))
                      }
                    },
                    view: unit
                  })

            }
          })
        }
      </>
    }).any([
      createFormRunner<E, FS>().mapContextFromProps(props => ({
        ...props.context,
        apiHandlers: {
          success: props.foreignMutations.apiHandlers?.success,
          error: props.foreignMutations.apiHandlers?.error
        }
      }))
    ])
