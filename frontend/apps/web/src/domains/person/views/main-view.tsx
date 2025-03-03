// import { EntityFormView, Unit, unit } from "ballerina-core";
// import { MostUglyValidationDebugView } from "./field-views";
// import { Person, PersonFormPredicateContext, PersonFormState } from "playground-core";

// export type PersonView = EntityFormView<Person, keyof Person, PersonFormState, PersonFormPredicateContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>]; }, Unit>;
// export const PersonView: PersonView = props => {
//   return <>
//     <table>
//       <tbody>
//         <tr>
//           <td>
//             <MostUglyValidationDebugView {...props} />
//           </td>
//         </tr>
//         <tr>
//           {props.VisibleFieldKeys.map(field => <td>
//             {props.EmbeddedFields[field]({
//               ...props, context:{...props.context, disabled:props.DisabledFieldKeys.has(field) }, view: unit })}
//           </td>)}
//         </tr>
//       </tbody>
//     </table>
//   </>;
// };
