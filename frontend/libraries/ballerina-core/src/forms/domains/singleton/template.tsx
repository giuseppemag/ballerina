import { List, OrderedMap, OrderedSet } from "immutable"
import { BasicUpdater, id, BasicPredicate, SimpleCallback, Unit, Debounced, Synchronized, unit, replaceWith, CoTypedFactory, Debounce, Synchronize, BasicFun } from "../../../../main"
import { Template, View } from "../../../template/state"
import { Value } from "../../../value/state"

export type ToPathUnions<a> = a[keyof a]
export type Paths<Entity, NestedPaths = Unit> = {
  [f in keyof Entity]:
    f extends keyof NestedPaths ?
      [f, ToPathUnions<NestedPaths[f]>]
    : [f]
}

// type OtherNestedThing = { x:boolean, y:string }
// type Address = { city:string, street:string, number:number, other:OtherNestedThing }
// type Person = { name:string, surname:string, birthday:Date, address:Address, other:OtherNestedThing }
// type OtherNestedThingPaths = Paths<OtherNestedThing, Unit>
// type AddressPaths = Paths<Address, { other:OtherNestedThingPaths }>
// type PersonPaths = ToPathUnions<Paths<Person, { address:AddressPaths, other:OtherNestedThingPaths }>>
// const f = (_:PersonPaths) => {
//   if (_[0] == "name") return
//   if (_[0] == "surname") return
//   if (_[0] == "birthday") return
//   if (_[0] == "address") {
//     _[1][0] == "city"
//     if (_[1][0] == "other") {
//       _[1][1][0] == "x"
//     }
//     return
//   }
//   _[1][0] == "x"
// }

export type ValidationError = string
export type FieldValidation = Array<ValidationError>
export type Path = Array<string>
export type ValidationErrorWithPath = [Path, ValidationError]
export type FieldValidationWithPath = Array<ValidationErrorWithPath>
export const FieldValidationWithPath = {
  Default:{
    fromFieldValidation:(_:FieldValidation) : FieldValidationWithPath => 
      _.map(_ => ([[], _])),      
  }
}
export type FormValidatorSynchronized = Synchronized<Unit, FieldValidationWithPath>
export type SharedFormState = { modifiedByUser: boolean, validation: Debounced<FormValidatorSynchronized> }
export const SharedFormState = {
  Default: (): SharedFormState => ({
    modifiedByUser: false,
    // start the validation so that it immediately runs and registers the first errors such as missing values and such
    validation: Debounced.Updaters.Template.value<FormValidatorSynchronized>(Synchronized.Updaters.value(replaceWith(unit)))(Debounced.Default(Synchronized.Default(unit)))
  })
}
export type EntityFormState<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  { [f in Fields]: FieldStates[f] & SharedFormState } & SharedFormState
export type EntityFormContext<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  Context & EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> & { visibleFields: OrderedMap<Fields, BasicPredicate<Context>> } & Value<Entity>
export type OnChange<Entity> = (updater: BasicUpdater<Entity>, path: List<string>) => void
export type EntityFormForeignMutationsExpected<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  ForeignMutationsExpected & { onChange: OnChange<Entity> }

export type FieldTemplates<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> = {
  [f in Fields]: EmbeddedFieldTemplate<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
}

export type EntityFormView<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  View<EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>, EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>, EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>, {
    EmbeddedFields: FieldTemplates<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    VisibleFieldKeys: OrderedSet<Fields>
  }>
export type EntityFormTemplate<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  Template<
    EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormView<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
  >
export type EmbeddedFieldTemplate<Entity, Fields extends (keyof Entity) & (keyof FieldStates), FieldStates, Context, ForeignMutationsExpected> =
  Template<
    EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
  >

export type FormStateFromEntity<E, S> = {
  [f in keyof E]: f extends keyof S ? S[f] & SharedFormState : SharedFormState
} & SharedFormState

export const Form = <Entity, FieldStates, Context, ForeignMutationsExpected>() => ({
  Default: <Fields extends (keyof Entity) & (keyof FieldStates)>() => {
    type State = EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
    type FieldTemplate<f extends Fields> = Template<Context & State[f] & Value<Entity[f]>, State[f], ForeignMutationsExpected & { onChange: OnChange<Entity[f]> }>
    type EntityFormConfig = { [f in Fields]: FieldTemplate<f> }

    return {
      config: id<EntityFormConfig>,
      template: (config: EntityFormConfig, validation:BasicFun<Entity, Promise<FieldValidationWithPath>>): EntityFormTemplate<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> => {
        const fieldTemplates: FieldTemplates<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> = {} as FieldTemplates<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
        const setFieldTemplate = <field extends Fields>(field: field) => {
          fieldTemplates[field] =
            config[field]
              .mapContext<EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>>(_ => ({ ..._, value: _.value[field], ...(_[field]) }) as any)
              .mapState<State>(_ => current => ({ ...current, [field]: _(current[field]) }))
              .mapForeignMutationsFromProps<EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>>(props =>
              ({
                ...props.foreignMutations,
                onChange: (_: BasicUpdater<Entity[field]>, path) => {
                  props.setState(_ => ({ ..._, 
                    modifiedByUser: true, 
                    validation:Debounced.Updaters.Template.value<FormValidatorSynchronized>(Synchronized.Updaters.value(replaceWith(unit)))(_.validation),
                    [field]:({
                      ..._[field], 
                      modifiedByUser:true,
                      validation:Debounced.Updaters.Template.value<FormValidatorSynchronized>(Synchronized.Updaters.value(replaceWith(unit)))(_[field].validation),
                    }) }))
                  setTimeout(() =>
                    props.foreignMutations.onChange((current: Entity): Entity => ({
                      ...current,
                      [field]: _(current[field])
                    }), path.push(field as string)),
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
            return <>
              <props.view {...props}
                VisibleFieldKeys={visibleFieldKeys}
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

export const ValidateRunner = <Context, FormState extends SharedFormState, ForeignMutationsExpected, Entity,>(
  validation:BasicFun<Entity, Promise<FieldValidationWithPath>>,
) => {
  const Co = CoTypedFactory<Context & Value<Entity> & FormState, FormState>()
  return Co.Template<ForeignMutationsExpected & { onChange: OnChange<Entity>; }>(
    Co.Repeat(
      Debounce<FormValidatorSynchronized, Value<Entity>>(
        Synchronize<Unit, FieldValidationWithPath, Value<Entity>>(
          _ => validation(_.value),
          () => "transient failure", 3, 50
        ), 50
      ).embed(_ => ({..._.validation, value:_.value}), (_) => curr => ({...curr, validation:_(curr.validation)}))
    ),
    {
      interval:15,
      runFilter:props => Debounced.Operations.shouldCoroutineRun(props.context.validation)
    }
  )
}