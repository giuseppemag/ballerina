import { EntityFormView, Unit, unit } from "ballerina-core";
import { PersonFormPredicateContext } from "../../predicates";
import { MostUglyValidationDebugView } from "../../../views/field-views";
import { Address, AddressFormState } from "../state";


export type AddressView = EntityFormView<Address, keyof Address, AddressFormState, PersonFormPredicateContext, Unit>;
export const AddressView: AddressView = props => <>
  <h2>Address</h2>
  <MostUglyValidationDebugView {...props} />
  {props.VisibleFieldKeys.map(field => props.EmbeddedFields[field](({ ...props, view: unit }))
  )}</>;
