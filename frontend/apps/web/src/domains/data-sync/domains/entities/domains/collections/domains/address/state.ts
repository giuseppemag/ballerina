import { SmallIdentifiable, Guid, simpleUpdater, Unit } from "ballerina-core";


export type Address = SmallIdentifiable & {
  city: string; street: string; number: string;
};
export const Address = {
  Default: (id: Guid, city: string, street: string, number: string): Address => ({ id, city, street, number }),
  Updaters: {
    Core: {
      ...simpleUpdater<Address>()("city"),
      ...simpleUpdater<Address>()("street"),
      ...simpleUpdater<Address>()("number"),
    }
  }
};
export type AddressMutations = {
  edit: Unit;
};
