import { Map } from "immutable";
import { simpleUpdater, Guid, mapUpdater } from "@ballerina/core";
import { InvoiceForm } from "../entities/domains/collections/domains/invoice/views/form";
import { AddressForm } from "../entities/domains/collections/domains/address/views/form";
import { UserForm } from "../entities/domains/singletons/domains/user/views/form";

export type Forms = {
  user: UserForm,
  invoices:Map<Guid, InvoiceForm>,
  addresses:Map<Guid, AddressForm>

};
export const Forms = {
  Default: (): Forms => ({
    user: UserForm.Default(),
    invoices:Map(),
    addresses:Map(),
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Forms>()("user"),
      ...mapUpdater<Forms>()("addresses", "address"),
      ...mapUpdater<Forms>()("invoices", "invoice"),
    }
  }
};
