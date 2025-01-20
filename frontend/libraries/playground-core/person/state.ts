import { faker } from "@faker-js/faker";
import { CollectionReference, CollectionSelection, Guid, FormStateFromEntity, DateFormState, EnumFormState, FormLabel, BaseEnumContext, SearchableInfiniteStreamState, SharedFormState, Predicate, ListFieldState, Maybe } from "ballerina-core";
import { Map, List, OrderedMap } from "immutable";
import { v4 } from "uuid";
import { Interest, PersonApi } from "./apis/mocks";
import { Address, City, AddressFormState } from "./domains/address/state";
import { PersonFormPredicateContext } from "./domains/predicates";


export type Gender = CollectionReference;
export type Department = CollectionReference;
export const Department = CollectionReference;

export type Person = {
  name: string;
  surname: string;
  birthday: Maybe<Date>;
  subscribeToNewsletter: boolean;
  gender: CollectionSelection<Gender>;
  interests: OrderedMap<Guid, Interest>;
  departments: OrderedMap<Guid, Department>;
  // address: List<Address>;
};
export const Person = {
  Default: Object.assign((name: string,
    surname: string,
    birthday: Date,
    subscribeToNewsletter: boolean,
    gender: CollectionSelection<Gender>,
    interests: OrderedMap<Guid, Interest>,
    departments: OrderedMap<Guid, Department>,
    address: List<Address>
  ): Person => ({
    name, surname, birthday, subscribeToNewsletter, gender, interests, departments,
    //  address,
  }),
    {
      mocked: (): Person => ({
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        birthday: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 45),
        subscribeToNewsletter: Math.random() > 0.5,
        gender: CollectionSelection<CollectionReference>().Default.right("no selection"),
        interests: OrderedMap(),
        departments: OrderedMap(),
        // address: List([{
        //   street: faker.location.street(),
        //   number: Math.floor(Math.random() * 500),
        //   city: Math.random() > 0.5 ?
        //     CollectionSelection<CollectionReference>().Default.right("no selection")
        //     :
        //     CollectionSelection<CollectionReference>().Default.left(City.Default(v4(), faker.location.city()))
        // }])
      })
    }),
  Operations: {
    VisibleFields: OrderedMap<keyof Person, Predicate<PersonFormPredicateContext>>([
      ["name", PersonFormPredicateContext.Predicates.True],
      ["surname", PersonFormPredicateContext.Predicates.True],
      ["gender", PersonFormPredicateContext.Predicates.True],
      ["subscribeToNewsletter", PersonFormPredicateContext.Predicates.True],
      ["interests", PersonFormPredicateContext.Predicates.SubscribedToNewsletter],
      ["departments", PersonFormPredicateContext.Predicates.True],
      // ["address", PersonFormPredicateContext.Predicates.BC.or(PersonFormPredicateContext.Predicates.FO)],
    ])
  }
};
export type PersonFormState = FormStateFromEntity<Person, {
  birthday: DateFormState;
  gender: EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Gender>, Gender>;
  interests: EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Interest>, Interest>;
  departments: SearchableInfiniteStreamState<Department>;
  // address: ListFieldState<Address, AddressFormState>;
}>;
export const PersonFormState = {
  Default: (): PersonFormState => ({
    ...SharedFormState.Default(),
    name: SharedFormState.Default(),
    surname: SharedFormState.Default(),
    subscribeToNewsletter: SharedFormState.Default(),
    birthday: ({ ...DateFormState.Default(), ...SharedFormState.Default() }),
    gender: ({ ...EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Gender>, Gender>().Default(), ...SharedFormState.Default() }),
    interests: ({ ...EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Interest>, Interest>().Default(), ...SharedFormState.Default() }),
    departments: ({ ...SearchableInfiniteStreamState<Department>().Default("", PersonApi.getDepartments()), ...SharedFormState.Default() }),
    // address: ListFieldState<Address, AddressFormState>().Default(Map())
  })
};
