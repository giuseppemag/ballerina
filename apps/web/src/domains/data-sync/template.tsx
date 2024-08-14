import { Template } from "@ballerina/core";
import { DataSyncForeignMutationsExpected, DataSyncReadonlyContext, DataSyncWritableState } from "./state";
import { QueueRunner } from "./coroutines/queue/runner";
import { DataSyncView } from "./views/view";

export const DataSyncTemplate =
  Template.Default<DataSyncReadonlyContext & DataSyncWritableState, DataSyncWritableState, DataSyncForeignMutationsExpected>(props =>
    <DataSyncView {...props} />
  ).any([
    QueueRunner
  ]);
