import { CoTypedFactory } from "ballerina-core";
import { DataSyncReadonlyContext, DataSyncWritableState } from "../state";


export const Co = CoTypedFactory<DataSyncReadonlyContext, DataSyncWritableState>();
