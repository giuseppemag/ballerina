import { SynchronizedEntities, Guid, Singleton, Entity, Collection, CollectionEntity, simpleUpdaterWithChildren, simpleUpdater } from "ballerina-core";
import { OrderedMap } from "immutable";
import { Address } from "./domains/collections/domains/address/state";
import { Invoice } from "./domains/collections/domains/invoice/state";
import { Collections } from "./domains/collections/state";
import { UserData, User } from "./domains/singletons/domains/user/state";
import { Singletons } from "./domains/singletons/state";


export type Entities = SynchronizedEntities<Singletons, Collections>;
export const Entities = {
  Default: (user: UserData | undefined, addresses: OrderedMap<Guid, Address>, invoices: OrderedMap<Guid, Invoice>): Entities => ({
    singletons: {
      user: Singleton<User>().Default(
        Entity<User>().Default(
          user ? User.Default.left(user) : User.Default.right("no user selected" as const)
        )
      )
    },
    collections: {
      addresses: Collection<Address>().Default(
        addresses.map(CollectionEntity<Address>().Default)
      ),
      invoices: Collection<Invoice>().Default(
        invoices.map(CollectionEntity<Invoice>().Default)
      ),
    }
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<Entities>()({
        ...simpleUpdater<Entities["singletons"]>()("user")
      })("singletons"),
      ...simpleUpdaterWithChildren<Entities>()({
        ...simpleUpdater<Entities["collections"]>()("addresses"),
        ...simpleUpdater<Entities["collections"]>()("invoices"),
      })("collections"),
    }
  }
};
