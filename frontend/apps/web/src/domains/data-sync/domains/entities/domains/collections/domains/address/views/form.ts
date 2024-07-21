import { SingletonFormWritableState, Unit, FormTemplateAndDefinition, SingletonFormTemplate, StringConfig } from "ballerina-core";
import { Address } from "../state";



export type AddressForm = SingletonFormWritableState<Address, never, never, Unit>;
export const AddressForm = {
  Default: (): AddressForm => ({})
};
export const AddressFormConfig: FormTemplateAndDefinition<Address, never, never, Unit> = {
  template: SingletonFormTemplate<Address, never, never, Unit>(),
  entityDescriptor: {
    id: StringConfig.Default(),
    city: StringConfig.Default(),
    street: StringConfig.Default(),
    number: StringConfig.Default(),
  },
  fieldOrder: ["city", "street", "number"],
};
