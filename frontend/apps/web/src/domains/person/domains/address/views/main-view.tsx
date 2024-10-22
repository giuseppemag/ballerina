import { EntityFormView, Unit, unit } from "ballerina-core";
import { MostUglyValidationDebugView } from "../../../views/field-views";
import { Address, AddressFormState, PersonFormPredicateContext } from "playground-core";


export type AddressView = EntityFormView<Address, keyof Address, AddressFormState, PersonFormPredicateContext, Unit>;
export const AddressView: AddressView = props => <>
  <h2>Address</h2>
  <MostUglyValidationDebugView {...props} />
  {props.VisibleFieldKeys.map(field => props.EmbeddedFields[field](({ ...props, 
    context:{...props.context, disabled:props.DisabledFieldKeys.has(field) },
    view: unit }))
  )}</>;
