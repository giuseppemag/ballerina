import { faker } from "@faker-js/faker";
import { BasicPredicate, CollectionReference, SearchableInfiniteStreamState, PromiseRepo, OrderedMapRepo, Guid, FieldValidationWithPath, ValidationErrorWithPath, EnumValue } from "ballerina-core";
import { OrderedMap, Range } from "immutable";
import { v4 } from "uuid";
import { PersonFormPredicateContext } from "../domains/predicates";
import { Gender, Department, Person } from "../state";

const genders = [ {Value: "M"}, {Value: "F"}, {Value: "X"}]
const interests = [ {Value: "Soccer"}, {Value: "Hockey"}, {Value: "BoardGames"}, {Value: "HegelianPhilosophy"}]

export type Interest = EnumValue;


export const PersonApi = {
  getDepartments: (): SearchableInfiniteStreamState<Department>["customFormState"]["getChunk"] => (_searchText) => (_streamPosition) => PromiseRepo.Default.mock(
    () => ({
      data: OrderedMapRepo.Default.fromIdentifiables(
        Range(0, 10).map(_ => Department.Default.stream(v4(), _searchText + faker.company.buzzPhrase() + " department")).toArray()
      ),
      hasMoreValues: Math.random() > 0.5
    })
  ),
};
