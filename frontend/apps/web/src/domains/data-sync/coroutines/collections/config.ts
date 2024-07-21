import { collectionSynchronizationContext, CollectionEntity, Synchronized, Synchronize, Value, Unit, PromiseRepo, unit, Guid } from "ballerina-core";
import { OrderedMap } from "immutable";
import { Address } from "../../domains/entities/domains/collections/domains/address/state";
import { Invoice } from "../../domains/entities/domains/collections/domains/invoice/state";
import { Collections, CollectionMutations } from "../../domains/entities/domains/collections/state";
import { DataSyncReadonlyContext, DataSyncWritableState, DataSync } from "../../state";

export const collectionsConfig = () => collectionSynchronizationContext<DataSyncReadonlyContext, Collections, CollectionMutations, DataSyncWritableState>({
  addresses: {
    entityName: "addresses",
    default: () => CollectionEntity<Address>().Default(Synchronized.Default(Address.Default("", "", "", ""))),
    edit: Synchronize<Value<Synchronized<Unit, Address>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit,
      () => "error", 0.8, 0.5), _ => "permanent failure", 5, 150),
    narrowing: _ => _.entities.collections.addresses,
    widening: DataSync().Updaters.Core.entities.children.Core.collections.children.addresses,
    add: (_entity: CollectionEntity<Address>) => Synchronize<Value<Synchronized<Unit, Address>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
    remove: (_entityId: Guid) => Synchronize<Value<Synchronized<Unit, Address>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
    dependees: []
  },
  invoices: {
    entityName: "invoices",
    default: () => CollectionEntity<Invoice>().Default(Synchronized.Default(Invoice.Default("", "", []))),
    edit: Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.8, 0.5), _ => "permanent failure", 5, 150),
    approve: Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.8, 0.5), _ => "permanent failure", 5, 150),
    reject: Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.8, 0.5), _ => "permanent failure", 5, 150),
    narrowing: _ => _.entities.collections.invoices,
    widening: DataSync().Updaters.Core.entities.children.Core.collections.children.invoices,
    add: (_entity: CollectionEntity<Invoice>) => Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
    remove: (_entityId: Guid) => Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
    dependees: []
  }
});
