import { Address, AddressMutations } from "./domains/address/state";
import { Invoice, InvoiceMutations } from "./domains/invoice/state";


export type Collections = {
  addresses: Address;
  invoices: Invoice;
};
export type CollectionMutations = {
  addresses: AddressMutations;
  invoices: InvoiceMutations;
};
