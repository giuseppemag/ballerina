import { CollectionReference, Sum, FormStateFromEntity, SearchableInfiniteStreamState, SharedFormState, Predicate, CollectionSelection } from "ballerina-core";
import { AddressApi } from "./apis/mocks";
import { OrderedMap } from "immutable";
import { PersonFormPredicateContext } from "../predicates";



export type City = CollectionReference;
export const City = CollectionReference;
export type Address = {
  street: string;
  number: number;
  city: CollectionSelection<City>;
};
export const Address = {
  Default: (
    street: string,
    number: number,
    city: CollectionSelection<City>
  ): Address => ({
    street, number, city
  }),
  Operations: {
    VisibleFields: OrderedMap<keyof Address, Predicate<PersonFormPredicateContext>>([
      ["city", PersonFormPredicateContext.Predicates.BC.or(PersonFormPredicateContext.Predicates.FO)],
      ["street", PersonFormPredicateContext.Predicates.SubscribedToNewsletter],
      ["number", PersonFormPredicateContext.Predicates.True]])
  }
};

export type AddressFormState = FormStateFromEntity<Address, {
  city: SearchableInfiniteStreamState<City>;
}>;
export const AddressFormState = {
  Default: (): AddressFormState => ({
    ...SharedFormState.Default(),
    street: SharedFormState.Default(),
    number: SharedFormState.Default(),
    city: ({ ...SearchableInfiniteStreamState<City>().Default("", AddressApi.getCities()), ...SharedFormState.Default() })
  })
};
