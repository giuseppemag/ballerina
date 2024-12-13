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
  Context & EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> & { visibleFields: OrderedMap<Fields, BasicPredicate<Context>>, disabledFields: OrderedMap<Fields, BasicPredicate<Context>>, header?: string } & Value<Entity>
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
    DisabledFieldKeys: OrderedSet<Fields>
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
    EntityFormContext<Entity, Fields, FieldStates, Context, ForeignMutationsExpected> & { disabled:boolean },
    EntityFormState<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>,
    EntityFormForeignMutationsExpected<Entity, Fields, FieldStates, Context, ForeignMutationsExpected>
  >

export type FormStateFromEntity<E, S> = {
  [f in keyof E]: f extends keyof S ? S[f] & SharedFormState : SharedFormState
} & SharedFormState
