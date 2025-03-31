// import {
//   ListType,
//   ParsedType,
//   UnionCaseType,
//   ValueOrErrors,
// } from "../../../../../../../../../../../../../../main";
// import {
//   NestedRenderer,
//   BaseSerializedNestedRenderer,
//   BaseNestedRenderer,
//   SerializedNestedRenderer,
// } from "../../state";
// import { List, Map } from "immutable";

// // TODO - should you be able to nest a union case?

// export type SerializedNestedUnionCaseRenderer = {
//   fields?: unknown;
//   extends?: unknown;
// };

// export type NestedUnionCaseRenderer<T> = BaseNestedRenderer & {
//   kind: "nestedUnionCaseRenderer";
//   fields: Map<string, NestedRenderer<T>>;
//   extendedFields: Map<string, NestedRenderer<T>>;
//   type: UnionCaseType<T>;
// };

// export const NestedUnionCaseRenderer = {
//   Default: <T>(
//     type: UnionCaseType<T>,
//     rendererPath: List<string>,
//     renderer: string,
//     fields: Map<string, NestedRenderer<T>>,
//     extendedFields: Map<string, NestedRenderer<T>>,
//     label?: string,
//     tooltip?: string,
//     details?: string,
//   ): NestedUnionCaseRenderer<T> => ({
//     kind: "nestedUnionCaseRenderer",
//     type,
//     rendererPath,
//     renderer,
//     fields,
//     extendedFields,
//     label,
//     tooltip,
//     details,
//   }),
//   Operations: {
//     hasFields: (
//       serialized: SerializedNestedUnionCaseRenderer,
//     ): serialized is SerializedNestedUnionCaseRenderer & {
//       fields: object;
//     } => serialized.fields != undefined && typeof serialized.fields == "object",
//     isValidExtends: (extendsClause: unknown): extendsClause is Array<string> =>
//       Array.isArray(extendsClause) &&
//       extendsClause.length > 0 &&
//       extendsClause.every((extend) => typeof extend == "string"),
//     tryAsValidNestedUnionCaseRenderer: (
//       rendererPath: List<string>,
//       serialized: SerializedNestedUnionCaseRenderer,
//     ): ValueOrErrors<
//       Omit<SerializedNestedUnionCaseRenderer, "fields" | "extends"> & {
//         fields: object;
//         extends?: Array<string>;
//       },
//       string
//     > => {
//       if (!NestedUnionCaseRenderer.Operations.hasFields(serialized))
//         return ValueOrErrors.Default.throwOne(
//           `fields is required for renderer ${rendererPath.join(".")}`,
//         );
//       const extendsClause = serialized.extends;
//       if (
//         extendsClause == null ||
//         (extendsClause != undefined &&
//           !NestedUnionCaseRenderer.Operations.isValidExtends(extendsClause))
//       )
//         return ValueOrErrors.Default.throwOne(
//           `extends clause is invalid for renderer ${rendererPath.join(".")}`,
//         );
//       return ValueOrErrors.Default.return({
//         fields: serialized.fields,
//         extends: extendsClause,
//       });
//     },
//   },

// //   Deserialize: <T>(
// //     type: UnionCaseType<T>,
// //     rendererPath: List<string>,
// //     serialized: SerializedNestedUnionCaseRenderer,
// //   ): ValueOrErrors<NestedUnionCaseRenderer<T>, string> => {
// //     return NestedUnionCaseRenderer.Operations.tryAsValidNestedUnionCaseRenderer(
// //       rendererPath,
// //       serialized,
// //     ).Then((serializedNestedUnionCaseRenderer) =>
// //         ValueOrErrors.Operations.All(
// //             List(
// //                 Object.entries(serializedNestedUnionCaseRenderer.fields).map(([key, value]) =>
// //                     NestedRenderer.Operations.Deserialize(
// //                         type.fields.[0],
// //                         rendererPath.push(key),
// //                         value,
// //                     )
// //                 )
// //             )
// //         )
//     //   NestedRenderer.Operations.Deserialize(
//     //     type.args[0],
//     //     rendererPath.push("elementRenderer"),
//     //     serializedNestedUnionCaseRenderer.elementRenderer,
//     //   ).Then((deserializedElementRenderer) => {
//     //     return ValueOrErrors.Default.return(
//     //       NestedUnionCaseRenderer.Default(
//     //         type,
//     //         rendererPath,
//     //         serializedNestedUnionCaseRenderer.renderer,
//     //         deserializedElementRenderer,
//     //         serializedNestedUnionCaseRenderer.label,
//     //         serializedNestedUnionCaseRenderer.tooltip,
//     //         serializedNestedUnionCaseRenderer.details,
//     //       ),
//     //     );
//     //   }),
//     // );
//   },
// };
