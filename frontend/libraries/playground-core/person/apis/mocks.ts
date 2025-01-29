import { faker } from "@faker-js/faker";
import { BasicPredicate, CollectionReference, SearchableInfiniteStreamState, PromiseRepo, OrderedMapRepo, Guid, FieldValidationWithPath, ValidationErrorWithPath } from "ballerina-core";
import { OrderedMap, Range } from "immutable";
import { v4 } from "uuid";
import { PersonFormPredicateContext } from "../domains/predicates";
import { Gender, Department, Person } from "../state";

const genders: Array<[Gender, BasicPredicate<PersonFormPredicateContext>]> = [
  [CollectionReference.Default(v4(), "M"), PersonFormPredicateContext.Predicates.True],
  [CollectionReference.Default(v4(), "F"), PersonFormPredicateContext.Predicates.True],
  [CollectionReference.Default(v4(), "X"), PersonFormPredicateContext.Predicates.BC],
  [CollectionReference.Default(v4(), "Y"), PersonFormPredicateContext.Predicates.SubscribedToNewsletter.or(PersonFormPredicateContext.Predicates.SuperAdmin)]
];
export type Interest = CollectionReference;
const interests: Array<[Interest, BasicPredicate<PersonFormPredicateContext>]> = [
  [CollectionReference.Default(v4(), "finance"), PersonFormPredicateContext.Predicates.BC],
  [CollectionReference.Default(v4(), "marketing"), PersonFormPredicateContext.Predicates.FO],
  [CollectionReference.Default(v4(), "management"), PersonFormPredicateContext.Predicates.SAP.or(PersonFormPredicateContext.Predicates.BC)],
  [CollectionReference.Default(v4(), "development"), PersonFormPredicateContext.Predicates.True],
];

export const PersonApi = {
  getDepartments: (): SearchableInfiniteStreamState<Department>["customFormState"]["getChunk"] => (_searchText) => (_streamPosition) => PromiseRepo.Default.mock(
    () => ({
      data: OrderedMapRepo.Default.fromSmallIdentifiables(
        Range(0, 20).map(_ => Department.Default(v4(), _searchText + faker.company.buzzPhrase() + " department")).toArray()
      ),
      hasMoreValues: Math.random() > 0.5
    })
  ),
  getGenders: (): Promise<OrderedMap<Guid, [Gender, BasicPredicate<PersonFormPredicateContext>]>> => PromiseRepo.Default.mock(() => OrderedMap(
    genders.map(_ => [_[0].id, _] as [Guid, [Gender, BasicPredicate<PersonFormPredicateContext>]])
  )
  ),
  getInterests: (): Promise<OrderedMap<Guid, [Interest, BasicPredicate<PersonFormPredicateContext>]>> => PromiseRepo.Default.mock(() => OrderedMap(
    interests.map(_ => [_[0].id, _] as [Guid, [Interest, BasicPredicate<PersonFormPredicateContext>]])
  )
  ),
  validate: (_:Person) : Promise<FieldValidationWithPath> =>
    PromiseRepo.Default.mock(() =>
      [
        ...(_.subscribeToNewsletter && _.interests.count() <= 0 ?
          [[["interests"], "please select at least one interest for the newsletter"] as ValidationErrorWithPath]
          : []),
        ...((_.name.length + _.surname.length) % 2 == 0 ?
          [[["name"], "|name| + |surname| should not be even"] as ValidationErrorWithPath,
          [["surname"], "|name| + |surname| should not be even"] as ValidationErrorWithPath]
          : []),
      ])
};
