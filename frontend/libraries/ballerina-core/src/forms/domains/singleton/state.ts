import { List, OrderedMap, OrderedSet } from "immutable";
import {
  BasicUpdater,
  id,
  BasicPredicate,
  SimpleCallback,
  Unit,
  Debounced,
  Synchronized,
  unit,
  replaceWith,
  CoTypedFactory,
  Debounce,
  Synchronize,
  BasicFun,
  FormFieldPredicateEvaluation,
  FormFieldPredicateEvaluations,
  FieldName,
  PredicateValue,
  ValueRecord,
} from "../../../../main";
import { Template, View } from "../../../template/state";
import { Value } from "../../../value/state";

export type ToPathUnions<a> = a[keyof a];
export type Paths<Entity, NestedPaths = Unit> = {
  [f in keyof Entity]: f extends keyof NestedPaths
    ? [f, ToPathUnions<NestedPaths[f]>]
    : [f];
};

export type ValidationError = string;
export type FieldValidation = Array<ValidationError>;
export type Path = Array<string>;
export type ValidationErrorWithPath = [Path, ValidationError];
export type FieldValidationWithPath = Array<ValidationErrorWithPath>;
export const FieldValidationWithPath = {
  Default: {
    fromFieldValidation: (_: FieldValidation): FieldValidationWithPath =>
      _.map((_) => [[], _]),
  },
};
export type FormValidatorSynchronized = Synchronized<
  Unit,
  FieldValidationWithPath
>;
export type CommonFormState = {
  modifiedByUser: boolean;
  validation: Debounced<FormValidatorSynchronized>;
};
export const CommonFormState = {
  Default: (): CommonFormState => ({
    modifiedByUser: false,
    // start the validation so that it immediately runs and registers the first errors such as missing values and such
    validation: Debounced.Updaters.Template.value<FormValidatorSynchronized>(
      Synchronized.Updaters.value(replaceWith(unit)),
    )(Debounced.Default(Synchronized.Default(unit))),
  }),
};
export type EntityFormState<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = {
  formFieldStates: {
    [f in Fields]: {
      customFormState: FieldStates[f];
      commonFormState: CommonFormState;
      formFieldStates: FieldStates[f];
      elementFormStates: FieldStates[f];
    };
  };
  commonFormState: CommonFormState;
};

export type EntityAction =
  | { kind: "add" }
  | { kind: "remove" }
  | { kind: "move"; to: number }
  | { kind: "duplicate" }
  | { kind: "insert" };
export type EntityFormContext<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = Context &
  EntityFormState<Fields, FieldStates, Context, ForeignMutationsExpected> & {
    disabled: boolean;
    visible: boolean;
    elementVisibilities: FormFieldPredicateEvaluation[] | undefined;
    elementDisabledFields: FormFieldPredicateEvaluation | undefined;
    extraContext: any;
    visibilities: FormFieldPredicateEvaluation | undefined;
    disabledFields: FormFieldPredicateEvaluation | undefined;
    label?: string;
  } & Value<ValueRecord> & { rootValue: ValueRecord };
export type OnChange<Entity> = (
  updater: BasicUpdater<Entity>,
  path: List<string | number | EntityAction>,
) => void;
export type EntityFormForeignMutationsExpected<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = ForeignMutationsExpected & {
  onChange: OnChange<PredicateValue>;
};

export type FieldTemplates<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = {
  [f in Fields]: EmbeddedFieldTemplate<
    Fields,
    FieldStates,
    Context,
    ForeignMutationsExpected
  >;
};

export type EntityFormView<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = View<
  EntityFormContext<Fields, FieldStates, Context, ForeignMutationsExpected>,
  EntityFormState<Fields, FieldStates, Context, ForeignMutationsExpected>,
  EntityFormForeignMutationsExpected<
    Fields,
    FieldStates,
    Context,
    ForeignMutationsExpected
  >,
  {
    EmbeddedFields: FieldTemplates<
      Fields,
      FieldStates,
      Context,
      ForeignMutationsExpected
    >;
    VisibleFieldKeys: OrderedSet<FieldName>;
    DisabledFieldKeys: OrderedSet<FieldName>;
  }
>;
export type EntityFormTemplate<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = Template<
  EntityFormContext<Fields, FieldStates, Context, ForeignMutationsExpected>,
  EntityFormState<Fields, FieldStates, Context, ForeignMutationsExpected>,
  EntityFormForeignMutationsExpected<
    Fields,
    FieldStates,
    Context,
    ForeignMutationsExpected
  >,
  EntityFormView<Fields, FieldStates, Context, ForeignMutationsExpected>
>;
export type EmbeddedFieldTemplate<
  Fields extends keyof FieldStates,
  FieldStates,
  Context,
  ForeignMutationsExpected,
> = Template<
  EntityFormContext<Fields, FieldStates, Context, ForeignMutationsExpected> & {
    disabled: boolean;
  },
  EntityFormState<Fields, FieldStates, Context, ForeignMutationsExpected>,
  EntityFormForeignMutationsExpected<
    Fields,
    FieldStates,
    Context,
    ForeignMutationsExpected
  >
>;

export type FormStateFromEntity<E, S> = {
  formFieldStates: {
    [f in keyof E]: f extends keyof S
      ? { customFormState: S[f]; commonFormState: CommonFormState }
      : { customFormState: Unit; commonFormState: CommonFormState };
  };
} & { commonFormState: CommonFormState };

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
