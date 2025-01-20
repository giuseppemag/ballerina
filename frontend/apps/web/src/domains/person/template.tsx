import { BaseEnumContext, BasicUpdater, BooleanForm, CollectionSelection, DateForm, EnumForm, EnumMultiselectForm, Form, FormLabel, id, InfiniteMultiselectDropdownForm, ListForm, Predicate, PromiseRepo, replaceWith, SharedFormState, StringForm, Unit, ValidationErrorWithPath } from "ballerina-core";
import { OrderedMap, Range, Set } from "immutable";
import { PersonFieldViews } from "./views/field-views";
import { AddressView } from "./domains/address/views/main-view";
import { PersonFormPredicateContext, PersonApi, Interest, AddressForm, Address, Department, Gender, Person, PersonFormState, AddressFormState } from "playground-core";

export const PersonFormBuilder = Form<Person, PersonFormState, PersonFormPredicateContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>] }, Unit>().Default<keyof Person>()
export const PersonForm = PersonFormBuilder.template({
  name: StringForm<PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["name should be at least 3 characters long"] : [])]))
    .withView(PersonFieldViews.StringView())
    .mapContext(_ => ({ ..._, label: "name" })),
  surname: StringForm<PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["surname should be at least 3 characters long"] : [])]))
    .withView(PersonFieldViews.StringView())
    .mapContext(_ => ({ ..._, label: "surname" })),
  subscribeToNewsletter: BooleanForm<PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.BooleanView())
    .mapContext(_ => ({ ..._, label: "subscribe to newsletter" })),
  birthday: DateForm<PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.DateView())
    .mapContext(_ => ({ ..._, label: "birthday" })),
  gender: EnumForm<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Gender>, Unit, Gender>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.EnumView())
    .mapContext(_ => ({ ..._, label: "gender", getOptions: PersonApi.getGenders })),
  interests: EnumMultiselectForm<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Interest>, Unit, Interest>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.Interests())
    .mapContext(_ => ({ ..._, label: "interests", getOptions: PersonApi.getInterests })),
  departments: InfiniteMultiselectDropdownForm<Department, PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.count() <= 0 ? ["please select at least one department"] : [])]))
    .withView(PersonFieldViews.InfiniteStreamMultiselectView())
    .mapContext(_ => ({ ..._, label: "department" })),
  // address: ListForm<Address, AddressFormState, PersonFormPredicateContext & FormLabel, Unit>(
  //   { Default:() => ({ ...AddressFormState.Default(), ...SharedFormState.Default() })}, 
  //   { Default:() => Address.Default("", 0, CollectionSelection().Default.right("no selection")) },
  //   AddressForm
  //   .withView(AddressView)
  //   .mapContext(_ => ({
  //     ..._,
  //     visibleFields: Address.Operations.VisibleFields,
  //     disabledFields: OrderedMap()
  //   })),
  //    _ => PromiseRepo.Default.mock(() => []))
  //     .withView(PersonFieldViews.ListViews.defaultList())
  //     .mapContext(_ => ({..._, label:"address"}))
}, PersonApi.validate)

