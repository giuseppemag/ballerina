import { DataSyncForeignMutationsExpected } from "../../state";
import { Co } from "../builder";
import { QueueProcessor } from "./processor";


export const QueueRunner = Co.Template<DataSyncForeignMutationsExpected>(
  QueueProcessor(),
  {
    runFilter: props => !props.context.queue.isEmpty(),
    interval: 50,
  }
);
