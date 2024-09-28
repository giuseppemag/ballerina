import { faker } from "@faker-js/faker";
import { BaseEnumContext, BasicPredicate, BooleanForm, CollectionReference, CollectionSelection, DateForm, DateFormState, EntityFormView, EnumForm, EnumFormState, EnumMultiselectForm, Form, FormLabel, FormStateFromEntity, Guid, id, InfiniteMultiselectDropdownForm, NumberForm, OrderedMapRepo, Predicate, PromiseRepo, replaceWith, SearchableInfiniteStreamForm, SearchableInfiniteStreamState, SharedFormState, StringForm, Sum, unit, Unit, ValidationErrorWithPath } from "ballerina-core";
import { Range, OrderedMap, Set, List } from "immutable";
import { v4 } from "uuid";
import { MostUglyValidationDebugView, PersonFieldViews } from "./views/field-views";

export type PersonContextFlags = "BC" | "F&O" | "SAP" | "SIMPLIFIED" | "SUPER ADMIN"
export type PersonContext = { flags: Set<PersonContextFlags>, person: Person, formState:PersonFormState, showAllErrors:boolean }
export const PersonContext = {
  Predicates: {
    True: Predicate((_: PersonContext) => true),
    False: Predicate((_: PersonContext) => false),
    SubscribedToNewsletter: Predicate((_: PersonContext) => _.person.subscribeToNewsletter),
    BC: Predicate((_: PersonContext) => _.flags.has("BC")),
    FO: Predicate((_: PersonContext) => _.flags.has("F&O")),
    SAP: Predicate((_: PersonContext) => _.flags.has("SAP")),
    Simplified: Predicate((_: PersonContext) => _.flags.has("SIMPLIFIED")),
    SuperAdmin: Predicate((_: PersonContext) => _.flags.has("SUPER ADMIN")),
  }
}

export type City = CollectionReference
export const City = CollectionReference
export type Address = {
  street: string,
  number: number,
  city: Sum<City, "no selection">
}
export const Address = {
  Default: (
    street: string,
    number: number,
    city: Sum<City, "no selection">
  ): Address => ({
    street, number, city
  })
}

export const AddressApi = {
  getCities: (): SearchableInfiniteStreamState<City>["getChunk"] => (_searchText) => (_streamPosition) =>
    PromiseRepo.Default.mock(
      () => ({
        data: OrderedMapRepo.Default.fromSmallIdentifiables(
          Range(0, 20).map(_ => City.Default(v4(), _searchText + faker.location.city())).toArray()
        ),
        hasMoreValues: Math.random() > 0.5
      })
    )
}

export type AddressFormState = FormStateFromEntity<Address, {
  city: SearchableInfiniteStreamState<City>
}>
export const AddressFormState = {
  Default: (): AddressFormState => ({
    ...SharedFormState.Default(),
    street: SharedFormState.Default(),
    number: SharedFormState.Default(),
    city: ({ ...SearchableInfiniteStreamState<City>().Default("", AddressApi.getCities()), ...SharedFormState.Default() })
  })
}
export type AddressView = EntityFormView<Address, keyof Address, AddressFormState, PersonContext, Unit>
export const AddressView: AddressView = props => <>
  <h2>Address</h2>
  <MostUglyValidationDebugView {...props} />
  {
    props.VisibleFieldKeys.map(field =>
      props.EmbeddedFields[field](({ ...props, view: unit }))
    )
  }</>
export const AddressFormBuilder = Form<Address, AddressFormState, PersonContext, Unit>().Default<keyof Address>()
export const AddressFormConfig = AddressFormBuilder.config(
  {
    street: StringForm<PersonContext & FormLabel, Unit>(
      _ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["street should be at least 3 characters long"] : [])]))
      .withView(PersonFieldViews.StringView())
      .mapContext(_ => ({ ..._, label: "street" })), 
    number: NumberForm<PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
      .withView(PersonFieldViews.NumberView())
      .mapContext(_ => ({ ..._, label: "number" })),
    city: SearchableInfiniteStreamForm<City, PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.kind == "r" ? ["a city must be selected"] : [])]))
      .withView(PersonFieldViews.InfiniteStreamView())
      .mapContext(_ => ({ ..._, label: "city" })),
  }
)
export const AddressForm = AddressFormBuilder.template(AddressFormConfig, _ => PromiseRepo.Default.mock(() => []))

export type Gender = CollectionReference
const genders: Array<[Gender, BasicPredicate<PersonContext>]> = [
  [CollectionReference.Default(v4(), "M"), PersonContext.Predicates.True],
  [CollectionReference.Default(v4(), "F"), PersonContext.Predicates.True],
  [CollectionReference.Default(v4(), "X"), PersonContext.Predicates.BC],
  [CollectionReference.Default(v4(), "Y"), PersonContext.Predicates.SubscribedToNewsletter.or(PersonContext.Predicates.SuperAdmin)]
]
export type Interest = CollectionReference
const interests: Array<[Interest, BasicPredicate<PersonContext>]> = [
  [CollectionReference.Default(v4(), "finance"), PersonContext.Predicates.BC],
  [CollectionReference.Default(v4(), "marketing"), PersonContext.Predicates.FO],
  [CollectionReference.Default(v4(), "management"), PersonContext.Predicates.SAP.or(PersonContext.Predicates.BC)],
  [CollectionReference.Default(v4(), "development"), PersonContext.Predicates.True],
]

export type Department = CollectionReference
export const Department = CollectionReference
export const PersonApi = {
  getDepartments: (): SearchableInfiniteStreamState<Department>["getChunk"] => (_searchText) => (_streamPosition) =>
    PromiseRepo.Default.mock(
      () => ({
        data: OrderedMapRepo.Default.fromSmallIdentifiables(
          Range(0, 20).map(_ => Department.Default(v4(), _searchText + faker.company.buzzPhrase() + " department")).toArray()
        ),
        hasMoreValues: Math.random() > 0.5
      })
    ),
  getGenders: () : Promise<OrderedMap<Guid, [Gender, BasicPredicate<PersonContext>]>> =>
    PromiseRepo.Default.mock(() => 
      OrderedMap(
        genders.map(_ => [_[0].id, _] as [Guid, [Gender, BasicPredicate<PersonContext>]])
      )
    ),
      getInterests: () : Promise<OrderedMap<Guid, [Interest, BasicPredicate<PersonContext>]>> =>
    PromiseRepo.Default.mock(() => 
      OrderedMap(
        interests.map(_ => [_[0].id, _] as [Guid, [Interest, BasicPredicate<PersonContext>]])
      )
    ),
}


export type Person = {
  name: string,
  surname: string,
  birthday: Date,
  subscribeToNewsletter: boolean,
  gender: CollectionSelection<Gender>,
  interests: OrderedMap<Guid, Interest>,
  departments: OrderedMap<Guid, Department>,
  address: Address
}
export const Person = {
  Default: (name: string,
    surname: string,
    birthday: Date,
    subscribeToNewsletter: boolean,
    gender: CollectionSelection<Gender>,
    interests: OrderedMap<Guid, Interest>,
    departments: OrderedMap<Guid, Department>,
    address: Address
  ): Person => ({
    name, surname, birthday, subscribeToNewsletter, gender, interests, departments, address,
  })
}
export type PersonFormState = FormStateFromEntity<Person, {
  birthday: DateFormState,
  gender: EnumFormState<PersonContext & FormLabel & BaseEnumContext<PersonContext, Gender>, Gender>,
  interests: EnumFormState<PersonContext & FormLabel & BaseEnumContext<PersonContext, Interest>, Interest>,
  departments: SearchableInfiniteStreamState<Department>,
  address: AddressFormState
}>
export const PersonFormState = {
  Default: (birthday: string): PersonFormState => ({
    ...SharedFormState.Default(),
    name: SharedFormState.Default(),
    surname: SharedFormState.Default(),
    subscribeToNewsletter: SharedFormState.Default(),
    birthday: ({ ...DateFormState.Default(birthday), ...SharedFormState.Default() }),
    gender: ({ ...EnumFormState<PersonContext & FormLabel & BaseEnumContext<PersonContext, Gender>, Gender>().Default(), ...SharedFormState.Default() }),
    interests: ({ ...EnumFormState<PersonContext & FormLabel & BaseEnumContext<PersonContext, Interest>, Interest>().Default(), ...SharedFormState.Default() }),
    departments: ({ ...SearchableInfiniteStreamState<Department>().Default("", PersonApi.getDepartments()), ...SharedFormState.Default() }),
    address: ({ ...AddressFormState.Default(), ...SharedFormState.Default() }),
  })
}

export const PersonFormBuilder = Form<Person, PersonFormState, PersonContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>] }, Unit>().Default<keyof Person>()
export const PersonForm = PersonFormBuilder.template({
  name: StringForm<PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["name should be at least 3 characters long"] : [])]))
    .withView(PersonFieldViews.StringView())
    .mapContext(_ => ({ ..._, label: "name" })),
  surname: StringForm<PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["surname should be at least 3 characters long"] : [])]))
    .withView(PersonFieldViews.StringView())
    .mapContext(_ => ({ ..._, label: "surname" })),
  subscribeToNewsletter: BooleanForm<PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.BooleanView())
    .mapContext(_ => ({ ..._, label: "subscribe to newsletter" })),
  birthday: DateForm<PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.DateView())
    .mapContext(_ => ({ ..._, label: "birthday" })),
  gender: EnumForm<PersonContext & FormLabel & BaseEnumContext<PersonContext, Gender>, Unit, Gender>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.EnumView())
    .mapContext(_ => ({ ..._, label: "gender", getOptions:PersonApi.getGenders })),
  interests: EnumMultiselectForm<PersonContext & FormLabel & BaseEnumContext<PersonContext, Interest>, Unit, Interest>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.Interests())
    .mapContext(_ => ({ ..._, label: "interests", getOptions:PersonApi.getInterests })),
  departments: InfiniteMultiselectDropdownForm<Department, PersonContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.count() <= 0 ? ["please select at least one interest"] : [])]))
    .withView(PersonFieldViews.InfiniteMultiselectDropdownView())
    .mapContext(_ => ({ ..._, label: "department" })),
  address: AddressForm
    .withView(AddressView)
    .mapContext(_ => ({
      ..._,
      visibleFields: OrderedMap([
        ["city", PersonContext.Predicates.BC.or(PersonContext.Predicates.FO)], 
        ["street", PersonContext.Predicates.SubscribedToNewsletter], 
        ["number", PersonContext.Predicates.True]])
    })),
}, _ => PromiseRepo.Default.mock(() => 
  [
    ...(_.subscribeToNewsletter && _.interests.count() <= 0 ? 
      [[["interests"], "please select at least one interest for the newsletter"] as ValidationErrorWithPath]
    : []),
    ...((_.name.length + _.surname.length) % 2 == 0 ? 
      [[["name"], "|name| + |surname| should not be even"] as ValidationErrorWithPath,
       [["surname"], "|name| + |surname| should not be even"] as ValidationErrorWithPath]
    : []),
  ]))

export type PersonView = EntityFormView<Person, keyof Person, PersonFormState, PersonContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>] }, Unit>
export const PersonView: PersonView = props => <>
  <table>
    <tbody>
      <tr>
        <td>
          <MostUglyValidationDebugView {...props} />
        </td>
      </tr>
      <tr>
        {props.context.columns.map(column =>
          <td>
            {
              column.filter(_ => props.VisibleFieldKeys.has(_)).map(field =>
                props.EmbeddedFields[field](({ ...props, view: unit }))
              )
            }
          </td>)}
      </tr>
    </tbody>
  </table>
</>
