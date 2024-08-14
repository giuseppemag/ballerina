import { SingletonFormWritableState, Unit, FormTemplateAndDefinition, SingletonFormTemplate, StringConfig, NumberConfig } from "@ballerina/core";
import { InvoiceLine } from "../state";


export type InvoiceLineForm = SingletonFormWritableState<InvoiceLine, never, never, Unit>;
export const InvoiceLineForm = {
  Default: (): InvoiceLineForm => ({})
};
export const InvoiceLineFormConfig: FormTemplateAndDefinition<InvoiceLine, never, never, Unit, Unit> = {
  template: SingletonFormTemplate<InvoiceLine, never, never, Unit, Unit>(),
  entityDescriptor: {
    id: StringConfig.Default(),
    product: StringConfig.Default(),
    pricePerUnit: NumberConfig.Default(),
    amount: NumberConfig.Default(),
  },
  fieldOrder: ["product", "pricePerUnit", "amount"],
};
