import { faker } from "@faker-js/faker";
import { SearchableInfiniteStreamState, PromiseRepo, OrderedMapRepo } from "ballerina-core";
import { v4 } from "uuid";
import { City } from "../state";
import { Range } from "immutable"


export const AddressApi = {
  getCities: (): SearchableInfiniteStreamState<City>["customFormState"]["getChunk"] => (_searchText) => (_streamPosition) => PromiseRepo.Default.mock(
    () => ({
      data: OrderedMapRepo.Default.fromIdentifiables(
        Range(0, 20).map(_ => City.Default(v4(), _searchText + faker.location.city())).toArray()
      ),
      hasMoreValues: Math.random() > 0.5
    })
  )
};
