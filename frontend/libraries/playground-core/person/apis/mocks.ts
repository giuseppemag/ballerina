import { faker } from "@faker-js/faker";
import {
  CollectionReference,
  SearchableInfiniteStreamState,
  PromiseRepo,
  OrderedMapRepo,
  Guid,
  FieldValidationWithPath,
  ValidationErrorWithPath,
} from "ballerina-core";
import { Range } from "immutable";
import { v4 } from "uuid";
import { Department } from "../state";

const genders = [{ Value: "M" }, { Value: "F" }, { Value: "X" }];
const interests = [
  { Value: "Soccer" },
  { Value: "Hockey" },
  { Value: "BoardGames" },
  { Value: "HegelianPhilosophy" },
];

export type Interest = CollectionReference;

export const PersonApi = {
  getDepartments:
    (): SearchableInfiniteStreamState<Department>["customFormState"]["getChunk"] =>
    (_searchText) =>
    (_streamPosition) =>
      PromiseRepo.Default.mock(() => ({
        data: OrderedMapRepo.Default.fromIdentifiables(
          Range(0, 20)
            .map((_) =>
              Department.Default(
                v4(),
                _searchText + faker.company.buzzPhrase() + " department",
              ),
            )
            .toArray(),
        ),
        hasMoreValues: Math.random() > 0.5,
      })),
};
