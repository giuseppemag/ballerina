import { SmallIdentifiable, Guid, simpleUpdater, orderedMapUpdater, Unit, OrderedMapRepo } from "ballerina-core";
import { OrderedMap } from "immutable";
import { InvoiceLine } from "./domains/invoice-line/state";


export type Invoice = SmallIdentifiable & {
  description: string;
  lines: OrderedMap<Guid, InvoiceLine>;
};
export const Invoice = {
  Default: (id: Guid, description:string, lines: Array<InvoiceLine>): Invoice => ({ id, description, lines:OrderedMapRepo.Default.fromSmallIdentifiables(lines) }),
  Updaters: {
    Core: {
      ...simpleUpdater<Invoice>()("description"),
      ...simpleUpdater<Invoice>()("lines"),
      ...orderedMapUpdater<Invoice>()("lines", "line"),
    }
  }
};
export type InvoiceMutations = {
  edit: Unit;
  approve: Unit;
  reject: Unit;
};

