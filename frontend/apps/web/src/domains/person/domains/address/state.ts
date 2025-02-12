import { CollectionReference, Sum, FormStateFromEntity, SearchableInfiniteStreamState, CommonFormState, Predicate, CollectionSelection, unit } from "ballerina-core";
import { OrderedMap } from "immutable";

import { AddressApi } from "playground-core";



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
  // Operations: {
  //   VisibleFields: OrderedMap<keyof Address, Predicate<PersonFormPredicateContext>>([
  //     ["city", PersonFormPredicateContext.Predicates.BC.or(PersonFormPredicateContext.Predicates.FO)],
  //     ["street", PersonFormPredicateContext.Predicates.SubscribedToNewsletter],
  //     ["number", PersonFormPredicateContext.Predicates.True]])
  // }
};

export type AddressFormState = FormStateFromEntity<Address, {
  city: SearchableInfiniteStreamState<City>;
}>;
export const AddressFormState = {
  Default: (): AddressFormState => ({
    commonFormState: CommonFormState.Default(),
    formFieldStates: {
      street: { commonFormState: CommonFormState.Default(), customFormState: unit },
      number: { commonFormState: CommonFormState.Default(), customFormState: unit },
      city: { customFormState: SearchableInfiniteStreamState<City>().Default("", AddressApi.getCities()), commonFormState: CommonFormState.Default() }
    }
  })
};
