import { EntityFormView, Unit, unit } from "ballerina-core";
import { PersonFormPredicateContext } from "../domains/predicates";
import { Person, PersonFormState } from "../state";
import { MostUglyValidationDebugView } from "./field-views";


export type PersonView = EntityFormView<Person, keyof Person, PersonFormState, PersonFormPredicateContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>]; }, Unit>;
export const PersonView: PersonView = props => {
  return <>
    <table>
      <tbody>
        <tr>
          <td>
            <MostUglyValidationDebugView {...props} />
          </td>
        </tr>
        <tr>
          {props.VisibleFieldKeys.map(field => <td>
            {props.EmbeddedFields[field]({ ...props, view: unit })}
          </td>)}
        </tr>
      </tbody>
    </table>
  </>;
};
