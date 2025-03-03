import { Guid } from "ballerina-core";
import { OrderedMap } from "immutable";
import { Worker } from "./domains/worker/state";

export type Queue = OrderedMap<Guid, Worker>;
