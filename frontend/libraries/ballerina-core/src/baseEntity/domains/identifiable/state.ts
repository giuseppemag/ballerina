import { Map, OrderedMap } from "immutable";

export type Guid = string;

export type Identifiable = { Id: Guid };
export type SmallIdentifiable = { id: string };

export const Identifiable = {
  Operations: {
    toMap: <T extends Identifiable>(values: Array<T>): Map<Guid, T> =>
      Map(values.map((_) => [_.Id, _])),
    toOrderedMap: <T extends Identifiable>(
      values: Array<T>,
    ): OrderedMap<Guid, T> => OrderedMap(values.map((_) => [_.Id, _])),
  },
};

export const SmallIdentifiable = {
  Operations: {
    toMap: <T extends SmallIdentifiable>(values: Array<T>): Map<Guid, T> =>
      Map(values.map((_) => [_.id, _])),
    toOrderedMap: <T extends SmallIdentifiable>(
      values: Array<T>,
    ): OrderedMap<Guid, T> => OrderedMap(values.map((_) => [_.id, _])),
  },
};
