import {
  collectionSynchronizationContext,
  CollectionEntity,
  Synchronized,
  Synchronize,
  Value,
  Unit,
  PromiseRepo,
  unit,
  Guid,
  Coroutine,
  OrderedMapRepo,
  AsyncState,
  withTrivialComparator,
} from "ballerina-core";
import { OrderedMap, Range } from "immutable";
import { Address } from "../../domains/entities/domains/collections/domains/address/state";
import { Invoice } from "../../domains/entities/domains/collections/domains/invoice/state";
import {
  Collections,
  CollectionMutations,
  WholeCollectionMutations,
} from "../../domains/entities/domains/collections/state";
import {
  DataSyncReadonlyContext,
  DataSyncWritableState,
  DataSync,
} from "../../state";
import { faker } from "@faker-js/faker";
import { v4 } from "uuid";
import { InvoiceLine } from "../../domains/entities/domains/collections/domains/invoice/domains/invoice-line/state";

export const collectionsConfig = () =>
  collectionSynchronizationContext<
    DataSyncReadonlyContext,
    Collections,
    CollectionMutations,
    WholeCollectionMutations,
    DataSyncWritableState
  >({
    addresses: {
      entityName: "addresses",
      id: (_) => _.id,
      edit: withTrivialComparator((_) =>
        Synchronize<Value<Synchronized<Unit, Address>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.8,
              0.5,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      ),
      narrowing: (_) => _.entities.collections.addresses,
      widening:
        DataSync().Updaters.Core.entities.children.Core.collections.children
          .addresses,
      add: (_entity: CollectionEntity<Address>) =>
        Synchronize<Value<Synchronized<Unit, Address>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.5,
              0,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      remove: (_entityId: Guid) =>
        Synchronize<Value<Synchronized<Unit, Address>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.5,
              0,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      // reload: () => Synchronize<Unit, OrderedMap<Guid, CollectionEntity<Address>>>(_ =>
      //   PromiseRepo.Default.mock(() => OrderedMapRepo.Default.fromSmallIdentifiables(Range(0, 4).map(_ =>
      //     Address.Default(v4(), faker.location.city(), faker.location.street(), faker.location.buildingNumber())
      //   ).toArray()).map(CollectionEntity<Address>().Default), () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
      wholeMutations: unit,
      dependees: [],
    },
    invoices: {
      entityName: "invoices",
      id: (_) => _.id,
      edit: withTrivialComparator((_) =>
        Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.8,
              0.5,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      ),
      approve: withTrivialComparator((_) =>
        Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.8,
              0.5,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      ),
      reject: withTrivialComparator((_) =>
        Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.8,
              0.5,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      ),
      narrowing: (_) => _.entities.collections.invoices,
      widening:
        DataSync().Updaters.Core.entities.children.Core.collections.children
          .invoices,
      add: (_entity: CollectionEntity<Invoice>) =>
        Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.5,
              0,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      remove: (_entityId: Guid) =>
        Synchronize<Value<Synchronized<Unit, Invoice>>, Unit>(
          (_) =>
            PromiseRepo.Default.mock<Unit>(
              () => unit,
              () => "error",
              0.5,
              0,
            ),
          (_) => "permanent failure",
          5,
          150,
        ),
      // reload: () => Synchronize<Unit, OrderedMap<Guid, CollectionEntity<Invoice>>>(_ =>
      //   PromiseRepo.Default.mock(() =>
      //     OrderedMapRepo.Default.fromSmallIdentifiables(Range(0, 4).map(_ =>
      //       Invoice.Default(v4(),
      //         faker.animal.dog(),
      //         Range(0, 1 + (Math.floor(Math.random() * 4))).map(j =>
      //           InvoiceLine.Default(v4(), faker.vehicle.vehicle(), Math.floor(Math.random() * 90 + 10), Math.floor(Math.random() * 90 + 10))
      //         ).toArray()
      //       )
      //     ).toArray()).map(CollectionEntity<Invoice>().Default), () => "error", 0.5, 0), _ => "permanent failure", 5, 150),
      wholeMutations: unit,
      dependees: [],
    },
  });
