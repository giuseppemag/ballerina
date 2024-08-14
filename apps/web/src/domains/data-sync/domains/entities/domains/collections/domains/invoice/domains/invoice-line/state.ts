import { SmallIdentifiable, Guid, simpleUpdater } from "@ballerina/core";


export type InvoiceLine = SmallIdentifiable & {
  product: string; amount: number; pricePerUnit: number;
};
export const InvoiceLine = {
  Default: (id: Guid, product: string, amount: number, pricePerUnit: number): InvoiceLine => ({ id, product, amount, pricePerUnit }),
  Updaters: {
    Core: {
      ...simpleUpdater<InvoiceLine>()("product"),
      ...simpleUpdater<InvoiceLine>()("amount"),
      ...simpleUpdater<InvoiceLine>()("pricePerUnit"),
    }
  }
};
