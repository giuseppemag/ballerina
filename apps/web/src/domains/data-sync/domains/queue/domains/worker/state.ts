import { Guid, BasicFun, DirtyStatus, Coroutine, Unit, SynchronizationResult } from "@ballerina/core";
import { DataSyncReadonlyContext, DataSyncWritableState } from "src/domains/data-sync/state";
import { Collections, CollectionMutations } from "../../../entities/domains/collections/state";
import { Singletons, SingletonMutations } from "../../../entities/domains/singletons/state";


export type Worker = {
  entity: ((keyof Singletons) & (keyof SingletonMutations)) | ((keyof Collections) & (keyof CollectionMutations));
  mutation: keyof (SingletonMutations[(keyof Singletons) & (keyof SingletonMutations)]) | keyof (CollectionMutations[(keyof Collections) & (keyof CollectionMutations)]) | "add" | "remove" | "reload";
  entityId: Guid;
  dirtySetter: BasicFun<DirtyStatus, Coroutine<DataSyncReadonlyContext & DataSyncWritableState, DataSyncWritableState, Unit>>;
  operation: Coroutine<DataSyncReadonlyContext & DataSyncWritableState, DataSyncWritableState, SynchronizationResult>;
};
