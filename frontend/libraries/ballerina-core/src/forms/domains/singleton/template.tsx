import { List, OrderedMap, OrderedSet } from "immutable"
import { BasicUpdater, id, BasicPredicate, SimpleCallback, Unit, Debounced, Synchronized, unit, replaceWith, CoTypedFactory, Debounce, Synchronize, BasicFun, EntityFormState, EntityFormContext, EntityFormForeignMutationsExpected, EntityFormTemplate, EntityFormView, FieldTemplates, FieldValidationWithPath, FormValidatorSynchronized, OnChange, SharedFormState, DirtyStatus } from "../../../../main"
import { Template, View } from "../../../template/state"
import { Value } from "../../../value/state"

export const Form = <Entity, FieldStates, Context, ForeignMutationsExpected>() => ({
  Default: <Fields extends (keyof Entity) & (keyof FieldStates)>() => {
    type State = EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
    type FieldTemplate<f extends Fields> = Template<Context & State[f] & Value<Entity[f]> & { disabled:boolean }, State[f], ForeignMutationsExpected & { onChange: OnChange<Entity[f]> }>
    type EntityFormConfig = { [f in Fields]: FieldTemplate<f> }

    return {
      config: id<EntityFormConfig>,
      template: (config: EntityFormConfig, validation?: BasicFun<Entity, Promise<FieldValidationWithPath>>): EntityFormTemplate<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> => {
        const fieldTemplates: FieldTemplates<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> = {} as FieldTemplates<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
        const setFieldTemplate = <field extends Fields>(field: field) => {
          fieldTemplates[field] =
            config[field]
              .mapContext<EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> & { disabled:boolean }>(_ => 
                {
                  // if (field == "emails") debugger
                  return ({ ..._, value: _.value[field], ...(_[field]) }) as any
                })
              .mapState<State>(_ => current => ({ ...current, [field]: _(current[field]) }))
              .mapForeignMutationsFromProps<EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>>(props =>
              ({
                ...props.foreignMutations,
                onChange: (_: BasicUpdater<Entity[field]>, path) => {
                  if(validation) {props.setState(_ => ({ ..._,
                    modifiedByUser: true, 
                    validation:Debounced.Updaters.Template.value<FormValidatorSynchronized>(Synchronized.Updaters.value(replaceWith(unit)))(_.validation),
                    [field]:({
                      ..._[field], 
                      modifiedByUser:true,
                      validation:Debounced.Updaters.Template.value<FormValidatorSynchronized>(Synchronized.Updaters.value(replaceWith(unit)))(_[field].validation),
                    }) }))
                  } else {
                    props.setState(_ => ({ ..._,
                      modifiedByUser: true,
                      [field]:({
                        ..._[field],
                        modifiedByUser:true,
                      }) }))
                  }
                  setTimeout(() =>
                    props.foreignMutations.onChange((current: Entity): Entity => ({
                      ...current,
                      [field]: _(current[field])
                    }), path.unshift(field as string)),
                    0)
                }
              }))
        }
        Object.keys(config).forEach((_) => {
          const field = _ as Fields
          setFieldTemplate(field)
        })
        return Template.Default<EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>, State,
          EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
          EntityFormView<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>>(props => {
            let visibleFieldKeys: OrderedSet<Fields> = OrderedSet()
            props.context.visibleFields.forEach((showField, field) => {
              if (!showField(props.context)) return
              visibleFieldKeys = visibleFieldKeys.add(field)
            })
            let disabledFieldKeys: OrderedSet<Fields> = OrderedSet()
            props.context.disabledFields.forEach((showField, field) => {
              if (!showField(props.context)) return
              disabledFieldKeys = disabledFieldKeys.add(field)
            })
            return <>
              <props.view {...props}
                VisibleFieldKeys={visibleFieldKeys}
                DisabledFieldKeys={disabledFieldKeys}
                EmbeddedFields={fieldTemplates}
              />
            </>
          })
          .any([
            ValidateRunner<
              EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>, 
              State, 
              EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
              Entity>(validation),
          ])
      }
    }
  }
})

// TODO: Validate runner and dirty status are also used to ensure to element is initialised, but this should be further debugged with a more correct solution
export const ValidateRunner = <Context, FormState extends SharedFormState, ForeignMutationsExpected, Entity,>(
  validation?:BasicFun<Entity, Promise<FieldValidationWithPath>>,
) => {
  const Co = CoTypedFactory<Context & Value<Entity> & FormState, FormState>()
  return Co.Template<ForeignMutationsExpected & { onChange: OnChange<Entity>; }>(
    validation ? Co.Repeat(
      Debounce<FormValidatorSynchronized, Value<Entity>>(
        Synchronize<Unit, FieldValidationWithPath, Value<Entity>>(
          _ => validation ? validation(_.value) : Promise.resolve([]),
          () => "transient failure", 3, 50
        ), 50
      ).embed(_ => ({..._.validation, value:_.value}), (_) => curr => ({...curr, validation:_(curr.validation)}))
    ) :
    Co.SetState((curr) => ({...curr, validation: Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>("not dirty"))}))
    ,
    {
      interval:15,
      runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.validation)
    }
  )
}