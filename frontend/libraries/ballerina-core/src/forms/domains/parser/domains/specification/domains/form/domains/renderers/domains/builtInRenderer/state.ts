// import { List, Map, OrderedMap, Set } from "immutable";
// import {
//   Base64FileForm,
//   BaseEnumContext,
//   BasicFun,
//   BooleanForm,
//   BoolExpr,
//   CollectionReference,
//   CollectionSelection,
//   CommonFormState,
//   DateForm,
//   DateFormState,
//   EnumForm,
//   EnumFormState,
//   EnumMultiselectForm,
//   EnumOptionsSources,
//   EnumReference,
//   Expr,
//   FieldPredicateExpression,
//   FormLabel,
//   Guid,
//   InfiniteMultiselectDropdownForm,
//   InjectedPrimitives,
//   ListFieldState,
//   ListForm,
//   MapFieldState,
//   MapForm,
//   Maybe,
//   NumberForm,
//   ParsedForms,
//   ParsedType,
//   PredicateValue,
//   SearchableInfiniteStreamForm,
//   SearchableInfiniteStreamState,
//   SecretForm,
//   StringForm,
//   SumFormState,
//   SumForm,
//   TupleFormState,
//   TupleForm,
//   unit,
//   Unit,
//   UnitForm,
//   Value,
//   ValueOption,
//   ValueRecord,
//   ParsedApplicationType,
//   UnionForm,
//   RawRenderer,
// } from "../../../../../../../../../../../../main";
// import { ValueOrErrors } from "../../../../../../../../../../../collections/domains/valueOrErrors/state";

// export type RawBuiltInRenderer = {
//   renderer?: any; 
//   stream?: any;
//   options?: any;
//   elementRenderer?: any;
//   elementLabel?: any;
//   elementTooltip?: any;
//   keyRenderer?: any;
//   valueRenderer?: any;
//   itemRenderers?: Array<any>;
//   leftRenderer?: any;
//   rightRenderer?: any;
//   details?: any;
//   cases?: Record<string, any>;
// };




// export type BuiltInRenderer<T> = (
//   | { kind: "unit" }
//   | { kind: "primitive" }
//   | { kind: "enum"; options: string }
//   | { kind: "stream"; stream: string }
//   | { kind: "list"; elementRenderer: BuiltInRenderer<T> }
//   | {
//       kind: "map";
//       keyRenderer: BuiltInRenderer<T>;
//       valueRenderer: BuiltInRenderer<T>;
//     }
//   | {
//       kind: "sum";
//       leftRenderer?: BuiltInRenderer<T>;
//       rightRenderer?: BuiltInRenderer<T>;
//     }
//   | {
//       kind: "tuple";
//       itemRenderers: Array<BuiltInRenderer<T>>;
//     }
//   | {
//       kind: "union";
//       cases: Map<string, string>;
//     }
//   | {
//       kind: "unionCase";
//       name: string;
//       fields: BuiltInRenderer<T>;
//     }
//   | {
//       kind: "lookup";
//     }
// ) & {
//   renderer: string;
//   type: ParsedType<T>;
//   disabled: boolean;
// };

// export const BuiltInRenderer = {
//   Default: {
//     primitive: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//     ): BuiltInRenderer<T> => ({
//       kind: "primitive",
//       type,
//       renderer,
//       disabled,
//     }),
//     lookup: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//     ): BuiltInRenderer<T> => ({
//       kind: "lookup",
//       type,
//       renderer,
//       disabled,
//     }),
//     enum: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       options: string,
//     ): BuiltInRenderer<T> => ({
//       kind: "enum",
//       type,
//       renderer,
//       disabled,
//       options,
//     }),
//     stream: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       stream: string,
//     ): BuiltInRenderer<T> => ({
//       kind: "stream",
//       type,
//       renderer,
//       disabled,
//       stream,
//     }),
//     list: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       elementRenderer: BuiltInRenderer<T>,
//     ): BuiltInRenderer<T> => ({
//       kind: "list",
//       type,
//       renderer,
//       disabled,
//       elementRenderer,
//     }),
//     map: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       keyRenderer: BuiltInRenderer<T>,
//       valueRenderer: BuiltInRenderer<T>,
//     ): BuiltInRenderer<T> => ({
//       kind: "map",
//       type,
//       renderer,
//       disabled,
//       keyRenderer,
//       valueRenderer,
//     }),
//     tuple: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       itemRenderers: Array<BuiltInRenderer<T>>,
//     ): BuiltInRenderer<T> => ({
//       kind: "tuple",
//       type,
//       renderer,
//       disabled,
//       itemRenderers,
//     }),
//     sum: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       leftRenderer?: BuiltInRenderer<T>,
//       rightRenderer?: BuiltInRenderer<T>,
//     ): BuiltInRenderer<T> => ({
//       kind: "sum",
//       type,
//       renderer,
//       disabled,
//       leftRenderer,
//       rightRenderer,
//     }),
//     unit: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//     ): BuiltInRenderer<T> => ({
//       kind: "unit",
//       type,
//       renderer,
//       disabled,
//     }),
//     union: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       cases: Record<string, string>,
//     ): BuiltInRenderer<T> => ({
//       kind: "union",
//       type,
//       renderer,
//       disabled,
//       cases: Map(cases),
//     }),
//     unionCase: <T>(
//       type: ParsedType<T>,
//       renderer: string,
//       disabled: boolean,
//       name: string,
//       fields: BuiltInRenderer<T>,
//     ): BuiltInRenderer<T> => ({
//       kind: "unionCase",
//       type,
//       renderer,
//       disabled,
//       name,
//       fields,
//     }),
//   },
//   Operations: {
//     Deserialize: <T>(
//       builtInType: ParsedType<T>,
//       renderer: RawRenderer,
//       types: Map<string, ParsedType<T>>,
//     ): ValueOrErrors<BuiltInRenderer<T>, string> => {
//       if (builtInType.kind == "primitive")
//         return ValueOrErrors.Default.return(
//           BuiltInRenderer.Default.primitive(
//             builtInType,
//             renderer.renderer,
//             renderer.disabled,
//           ),
//         );
//       if (builtInType.kind == "application" && "options" in renderer)
//         return ValueOrErrors.Default.return(
//           BuiltInRenderer.Default.enum(
//             builtInType,
//             renderer.renderer,
//             renderer.disabled,
//             renderer.options,
//           ),
//         );
//       if (builtInType.kind == "application" && "stream" in renderer)
//         return ValueOrErrors.Default.return(
//           BuiltInRenderer.Default.stream(
//             builtInType,
//             renderer.renderer,
//             renderer.disabled,
//             renderer.stream,
//           ),
//         );
//       if (builtInType.kind == "application" && builtInType.value == "List")
//         return BuiltInRenderer.Operations.Deserialize(
//           builtInType.args[0],
//           renderer.elementRenderer,
//           types,
//         ).Then((elementRenderer) =>
//           ValueOrErrors.Default.return(
//             BuiltInRenderer.Default.list(
//               builtInType,
//               renderer.renderer,
//               renderer.disabled,
//               elementRenderer,
//             ),
//           ),
//         );
//       if (builtInType.kind == "application" && builtInType.value == "Map")
//         return BuiltInRenderer.Operations.Deserialize(
//           builtInType.args[0],
//           renderer.keyRenderer,
//           types,
//         ).Then((keyRenderer) =>
//           BuiltInRenderer.Operations.Deserialize(
//             builtInType.args[1],
//             renderer.valueRenderer,
//             types,
//           ).Then((valueRenderer) =>
//             ValueOrErrors.Default.return(
//               BuiltInRenderer.Default.map(
//                 builtInType,
//                 renderer.renderer,
//                 renderer.disabled,
//                 keyRenderer,
//                 valueRenderer,
//               ),
//             ),
//           ),
//         );

//       if (builtInType.kind == "application" && builtInType.value == "Tuple")
//         return ValueOrErrors.Operations.All(
//           List(
//             renderer.itemRenderers?.map((item, i) =>
//               BuiltInRenderer.Operations.Deserialize(
//                 builtInType.args[i],
//                 item,
//                 types,
//               ),
//             ),
//           ),
//         ).Then((itemRenderers) =>
//           ValueOrErrors.Default.return(
//             BuiltInRenderer.Default.tuple(
//               builtInType,
//               renderer.renderer,
//               renderer.disabled,
//               itemRenderers.toArray(),
//             ),
//           ),
//         );

//       if (builtInType.kind == "application" && builtInType.value == "Sum")
//         return BuiltInRenderer.Operations.Deserialize(
//           builtInType.args[0],
//           renderer.leftRenderer,
//           types,
//         ).Then((leftRenderer) =>
//           BuiltInRenderer.Operations.Deserialize(
//             builtInType.args[1],
//             renderer.rightRenderer,
//             types,
//           ).Then((rightRenderer) =>
//             ValueOrErrors.Default.return(
//               BuiltInRenderer.Default.sum(
//                 builtInType,
//                 renderer.renderer,
//                 renderer.disabled,
//                 leftRenderer,
//                 rightRenderer,
//               ),
//             ),
//           ),
//         );
//       if (builtInType.kind == "union") {
//         return ValueOrErrors.Operations.All(
//           List<ValueOrErrors<[string, BuiltInRenderer<T>], string>>(
//             Object.entries(renderer.cases ?? {}).map(([caseName, caseRenderer], index) =>
//               BuiltInRenderer.Operations.Deserialize(
//                 builtInType.args[index],
//                 caseRenderer,
//                 types,
//               ).Then((renderer) =>
//                 ValueOrErrors.Default.return([caseName, renderer]),
//               ),
//             ),
//           ),
//         ).Then((cases) =>
//           ValueOrErrors.Default.return(
//             BuiltInRenderer.Default.union(
//               builtInType,
//               renderer.renderer,
//               renderer.disabled,
//               cases,
//             ),
//           ),
//         );
//       }
//       if (builtInType.kind == "unionCase") {
//         return ValueOrErrors.Default.return(
//           BuiltInRenderer.Default.unionCase(
//             builtInType,
//             renderer.renderer,
//             renderer.disabled,
//             renderer.name,
//             renderer.fields,
//           ),
//         );
//       }
//       if (builtInType.kind == "lookup") {
//         return ValueOrErrors.Default.return(
//           BuiltInRenderer.Default.lookup(
//             builtInType,
//             renderer.renderer,
//             renderer.disabled,
//           ),
//         );
//       }
//       return ValueOrErrors.Default.throwOne(
//         `Invalid field type ${JSON.stringify(
//           builtInType,
//         )} for field ${JSON.stringify(renderer)}`,
//       );
//     },
//     //// TODO - everything below here should be removed after writing dispatchers
//     FormViewToViewKind: (
//       viewName: string | undefined,
//       formViews: Record<string, any>,
//       formNames: Set<string>,
//     ) => {
//       if (viewName == undefined) {
//         throw Error(`cannot resolve view ${viewName}`); // TODO -- better error handling
//       }
//       if (formNames.has(viewName)) {
//         return "form";
//       }
//       const viewTypes = Object.keys(formViews);
//       for (const viewType of viewTypes) {
//         if (viewName in formViews[viewType]) {
//           return viewType;
//         }
//       }
//       throw Error(`cannot resolve view ${viewName}`); // TODO -- better error handling
//     },
//     RendererToForm: <T>(
//       fieldName: string,
//       parsingContext: {
//         formViews: Record<string, Record<string, any>>;
//         forms: ParsedForms<T>;
//         nestedContainerFormView: any;
//         defaultValue: BasicFun<ParsedType<T>, any>;
//         defaultState: BasicFun<ParsedType<T>, any>;
//         enumOptionsSources: EnumOptionsSources;
//         infiniteStreamSources: any;
//         injectedPrimitives?: InjectedPrimitives<T>;
//       },
//       parsedRenderer: BuiltInRenderer<T>,
//     ): ValueOrErrors<
//       {
//         form: Form;
//         visibilityPredicateExpression: FieldPredicateExpression;
//         disabledPredicatedExpression: FieldPredicateExpression;
//       },
//       string
//     > => {
//       const viewKind = ParsedRenderer.Operations.FormViewToViewKind(
//         parsedRenderer.renderer,
//         parsingContext.formViews,
//         parsingContext.forms.keySeq().toSet(),
//       );
//       switch (parsedRenderer.kind) {
//         case "primitive":
//         case "enum":
//         case "stream":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) => {
//               return Expr.Operations.parse(
//                 parsedRenderer.disabled ?? false,
//               ).Then((disabledExpr) =>
//                 ValueOrErrors.Default.return({
//                   form: {
//                     renderer: ParsedRenderer.Operations.FormRenderers(
//                       parsedRenderer,
//                       parsingContext.formViews,
//                       viewKind,
//                       parsedRenderer.renderer,
//                       parsedRenderer.label,
//                       parsedRenderer.tooltip,
//                       parsedRenderer.details,
//                       parsingContext.enumOptionsSources,
//                       parsingContext.injectedPrimitives,
//                     ),
//                     initialValue: parsingContext.defaultValue(
//                       parsedRenderer.type,
//                     ),
//                     initialState: ParsedRenderer.Operations.FormStates(
//                       viewKind,
//                       parsedRenderer.renderer,
//                       parsingContext.infiniteStreamSources,
//                       parsingContext.injectedPrimitives,
//                       parsedRenderer.kind == "stream"
//                         ? parsedRenderer.stream
//                         : undefined,
//                     ),
//                   },
//                   visibilityPredicateExpression:
//                     FieldPredicateExpression.Default.primitive(visibilityExpr),
//                   disabledPredicatedExpression:
//                     FieldPredicateExpression.Default.primitive(disabledExpr),
//                 }),
//               );
//             },
//           );
//         case "unit":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) =>
//                   ValueOrErrors.Default.return({
//                     form: {
//                       renderer: UnitForm<any & FormLabel>()
//                         .withView(
//                           parsingContext.formViews[viewKind][
//                             parsedRenderer.renderer
//                           ]() as any,
//                         )
//                         .mapContext<any>((_) => ({
//                           ..._,
//                           label: parsedRenderer.label,
//                           tooltip: parsedRenderer.tooltip,
//                           details: parsedRenderer.details,
//                         })),
//                       initialValue: parsingContext.defaultValue(
//                         parsedRenderer.type,
//                       ),
//                       initialState: {
//                         commonFormState: CommonFormState.Default(),
//                       },
//                     },
//                     visibilityPredicateExpression:
//                       FieldPredicateExpression.Default.unit(visibilityExpr),
//                     disabledPredicatedExpression:
//                       FieldPredicateExpression.Default.unit(disabledExpr),
//                   }),
//               ),
//           );
//         case "record":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) =>
//                   ValueOrErrors.Default.return({
//                     form: {
//                       renderer: parsingContext.forms
//                         .get(parsedRenderer.renderer)!
//                         .form.withView(parsingContext.nestedContainerFormView)
//                         .mapContext<any>((_) => ({
//                           ..._,
//                           label: parsedRenderer.label,
//                           tooltip: parsedRenderer.tooltip,
//                           details: parsedRenderer.details,
//                         })),
//                       initialValue: parsingContext.defaultValue(
//                         parsedRenderer.type,
//                       ),
//                       initialState: parsingContext.forms.get(
//                         parsedRenderer.renderer,
//                       )!.initialFormState,
//                     },
//                     visibilityPredicateExpression:
//                       FieldPredicateExpression.Default.record(
//                         visibilityExpr,
//                         parsingContext.forms.get(parsedRenderer.renderer)!
//                           .visibilityPredicateExpressions,
//                       ),
//                     disabledPredicatedExpression:
//                       FieldPredicateExpression.Default.record(
//                         disabledExpr,
//                         parsingContext.forms.get(parsedRenderer.renderer)!
//                           .disabledPredicatedExpressions,
//                       ),
//                   }),
//               ),
//           );
//         case "union":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) =>
//                   ValueOrErrors.Default.return({
//                     form: {
//                       renderer: UnionForm<any & FormLabel, Unit>(
//                         parsedRenderer.cases.map(
//                           (caseName) =>
//                             parsingContext.forms.get(caseName)!.form,
//                         ),
//                       ),
//                     },
//                   }),
//               ),
//           );
//         case "list":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) =>
//                   ParsedRenderer.Operations.RendererToForm(
//                     fieldName,
//                     parsingContext,
//                     parsedRenderer.elementRenderer,
//                   ).Then((parsedElementRenderer) =>
//                     ValueOrErrors.Default.return({
//                       form: {
//                         renderer: ListForm<any, any & FormLabel, Unit>(
//                           {
//                             Default: () =>
//                               parsedElementRenderer.form.initialState,
//                           },
//                           {
//                             Default: () =>
//                               parsedElementRenderer.form.initialValue,
//                           },
//                           parsedElementRenderer.form.renderer,
//                         )
//                           .withView(
//                             parsingContext.formViews[viewKind][
//                               parsedRenderer.renderer
//                             ]() as any,
//                           )
//                           .mapContext<any>((_) => {
//                             return {
//                               ..._,
//                               label: parsedRenderer.label,
//                               tooltip: parsedRenderer.tooltip,
//                               details: parsedRenderer.details,
//                             };
//                           }),
//                         initialValue: parsingContext.defaultValue(
//                           parsedRenderer.type,
//                         ),
//                         initialState: ListFieldState<any>().Default(Map()),
//                       },
//                       visibilityPredicateExpression:
//                         FieldPredicateExpression.Default.list(
//                           visibilityExpr,
//                           parsedElementRenderer.visibilityPredicateExpression,
//                         ),
//                       disabledPredicatedExpression:
//                         FieldPredicateExpression.Default.list(
//                           disabledExpr,
//                           parsedElementRenderer.disabledPredicatedExpression,
//                         ),
//                     }),
//                   ),
//               ),
//           );
//         case "map":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) =>
//                   ParsedRenderer.Operations.RendererToForm(
//                     fieldName,
//                     parsingContext,
//                     parsedRenderer.keyRenderer,
//                   ).Then((parsedKeyRenderer) =>
//                     ParsedRenderer.Operations.RendererToForm(
//                       fieldName,
//                       parsingContext,
//                       parsedRenderer.valueRenderer,
//                     ).Then((parsedValueRenderer) =>
//                       ValueOrErrors.Default.return({
//                         form: {
//                           renderer: MapForm<any, any, any & FormLabel, Unit>(
//                             {
//                               Default: () =>
//                                 parsedKeyRenderer.form.initialState,
//                             },
//                             {
//                               Default: () =>
//                                 parsedValueRenderer.form.initialState,
//                             },
//                             {
//                               Default: () =>
//                                 parsedKeyRenderer.form.initialValue,
//                             },
//                             {
//                               Default: () =>
//                                 parsedValueRenderer.form.initialValue,
//                             },
//                             parsedKeyRenderer.form.renderer,
//                             parsedValueRenderer.form.renderer,
//                           )
//                             .withView(
//                               parsingContext.formViews[viewKind][
//                                 parsedRenderer.renderer
//                               ]() as any,
//                             )
//                             .mapContext<any>((_) => ({
//                               ..._,
//                               label: parsedRenderer.label,
//                               tooltip: parsedRenderer.tooltip,
//                               details: parsedRenderer.details,
//                             })),
//                           initialValue: parsingContext.defaultValue(
//                             parsedRenderer.type,
//                           ),
//                           initialState: MapFieldState<any, any>().Default(
//                             Map(),
//                           ),
//                         },
//                         visibilityPredicateExpression:
//                           FieldPredicateExpression.Default.map(
//                             visibilityExpr,
//                             parsedKeyRenderer.visibilityPredicateExpression,
//                             parsedValueRenderer.visibilityPredicateExpression,
//                           ),
//                         disabledPredicatedExpression:
//                           FieldPredicateExpression.Default.map(
//                             disabledExpr,
//                             parsedKeyRenderer.disabledPredicatedExpression,
//                             parsedValueRenderer.disabledPredicatedExpression,
//                           ),
//                       }),
//                     ),
//                   ),
//               ),
//           );
//         case "tuple":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) => {
//                   return ValueOrErrors.Operations.All(
//                     List(
//                       parsedRenderer.itemRenderers.map((item) =>
//                         ParsedRenderer.Operations.RendererToForm(
//                           fieldName,
//                           parsingContext,
//                           item,
//                         ),
//                       ),
//                     ),
//                   ).Then((itemRenderers) =>
//                     ValueOrErrors.Default.return({
//                       form: {
//                         renderer: TupleForm<any, any & FormLabel, Unit>(
//                           itemRenderers.map((item) => item.form.initialState),
//                           itemRenderers.map((item) => item.form.renderer),
//                         )
//                           .withView(
//                             parsingContext.formViews[viewKind][
//                               parsedRenderer.renderer
//                             ]() as any,
//                           )
//                           .mapContext<any>((_) => ({
//                             ..._,
//                             label: parsedRenderer.label,
//                             tooltip: parsedRenderer.tooltip,
//                             details: parsedRenderer.details,
//                           })),
//                         initialValue: parsingContext.defaultValue(
//                           parsedRenderer.type,
//                         ),
//                         initialState: TupleFormState<any>().Default(
//                           itemRenderers.map((item) => item.form.initialState),
//                         ),
//                       },
//                       visibilityPredicateExpression:
//                         FieldPredicateExpression.Default.tuple(
//                           visibilityExpr,
//                           itemRenderers
//                             .map((item) => item.visibilityPredicateExpression)
//                             .toArray(),
//                         ),
//                       disabledPredicatedExpression:
//                         FieldPredicateExpression.Default.tuple(
//                           disabledExpr,
//                           itemRenderers
//                             .map((item) => item.disabledPredicatedExpression)
//                             .toArray(),
//                         ),
//                     }),
//                   );
//                 },
//               ),
//           );
//         case "sum":
//           return Expr.Operations.parse(parsedRenderer.visible ?? true).Then(
//             (visibilityExpr) =>
//               Expr.Operations.parse(parsedRenderer.disabled ?? false).Then(
//                 (disabledExpr) => {
//                   // Sums may be generic, they may not have a left or right renderer when
//                   // control to switch between left and right is needed by the parent.
//                   const parsedLeftRenderer =
//                     parsedRenderer.leftRenderer != undefined
//                       ? ParsedRenderer.Operations.RendererToForm(
//                           fieldName,
//                           parsingContext,
//                           parsedRenderer.leftRenderer,
//                         )
//                       : undefined;
//                   const parsedRightRenderer =
//                     parsedRenderer.rightRenderer != undefined
//                       ? ParsedRenderer.Operations.RendererToForm(
//                           fieldName,
//                           parsingContext,
//                           parsedRenderer.rightRenderer,
//                         )
//                       : undefined;

//                   if (
//                     parsedLeftRenderer != undefined &&
//                     parsedLeftRenderer.kind == "errors" &&
//                     parsedRightRenderer != undefined &&
//                     parsedRightRenderer.kind == "errors"
//                   ) {
//                     return ValueOrErrors.Default.throw(
//                       parsedLeftRenderer.errors.concat(
//                         parsedRightRenderer.errors,
//                       ),
//                     );
//                   }
//                   if (
//                     parsedLeftRenderer != undefined &&
//                     parsedLeftRenderer.kind == "errors"
//                   ) {
//                     return parsedLeftRenderer;
//                   }
//                   if (
//                     parsedRightRenderer != undefined &&
//                     parsedRightRenderer.kind == "errors"
//                   ) {
//                     return parsedRightRenderer;
//                   }

//                   const leftFormState =
//                     parsedLeftRenderer != undefined
//                       ? parsedLeftRenderer.value.form.initialState
//                       : parsingContext.defaultState(
//                           (parsedRenderer.type as ParsedApplicationType<T>)
//                             .args[0],
//                         );
//                   const rightFormState =
//                     parsedRightRenderer != undefined
//                       ? parsedRightRenderer.value.form.initialState
//                       : parsingContext.defaultState(
//                           (parsedRenderer.type as ParsedApplicationType<T>)
//                             .args[1],
//                         );

//                   return ValueOrErrors.Default.return({
//                     form: {
//                       renderer: SumForm<any, any, any & FormLabel, Unit>(
//                         leftFormState,
//                         rightFormState,
//                         parsedLeftRenderer?.value.form.renderer,
//                         parsedRightRenderer?.value.form.renderer,
//                       )
//                         .withView(
//                           parsingContext.formViews[viewKind][
//                             parsedRenderer.renderer
//                           ]() as any,
//                         )
//                         .mapContext<any>((_) => ({
//                           ..._,
//                           label: parsedRenderer.label,
//                           tooltip: parsedRenderer.tooltip,
//                           details: parsedRenderer.details,
//                         })),
//                       initialValue: parsingContext.defaultValue(
//                         parsedRenderer.type,
//                       ),
//                       initialState: SumFormState<any, any>().Default({
//                         left:
//                           parsedLeftRenderer?.value.form.initialState ??
//                           leftFormState,
//                         right:
//                           parsedRightRenderer?.value.form.initialState ??
//                           rightFormState,
//                       }),
//                     },
//                     visibilityPredicateExpression:
//                       FieldPredicateExpression.Default.sum(
//                         visibilityExpr,
//                         parsedLeftRenderer?.value.visibilityPredicateExpression,
//                         parsedRightRenderer?.value
//                           .visibilityPredicateExpression,
//                       ),
//                     disabledPredicatedExpression:
//                       FieldPredicateExpression.Default.sum(
//                         disabledExpr,
//                         parsedLeftRenderer?.value.disabledPredicatedExpression,
//                         parsedRightRenderer?.value.disabledPredicatedExpression,
//                       ),
//                   });
//                 },
//               ),
//           );
//         default:
//           return ValueOrErrors.Default.throw(
//             List([
//               `error: the kind for ${viewKind}::${parsedRenderer} cannot be found`,
//             ]),
//           );
//       }
//     },
//     FormRenderers: <T>(
//       rendererConfig: ParsedRenderer<T>,
//       formViews: Record<string, Record<string, any>>,
//       viewKind: string,
//       viewName: any,
//       label: string | undefined,
//       tooltip: string | undefined,
//       details: string | undefined,
//       enumOptionsSources: EnumOptionsSources,
//       injectedPrimitives?: InjectedPrimitives<T>,
//     ): any => {
//       if (viewKind == "unit") {
//         return UnitForm<any & FormLabel>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & CommonFormState & Value<Unit>>((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       }
//       if (viewKind == "boolean")
//         return BooleanForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & CommonFormState & Value<boolean>>((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       if (viewKind == "date")
//         return DateForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & DateFormState & Value<Maybe<Date>>>((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       if (viewKind == "number")
//         return NumberForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & CommonFormState & Value<number>>((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       if (viewKind == "string")
//         return StringForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & CommonFormState & Value<string>>((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       if (viewKind == "enumSingleSelection" && rendererConfig.kind == "enum")
//         return EnumForm<any & FormLabel & BaseEnumContext, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & EnumFormState & ValueOption>((_) => {
//             return {
//               ..._,
//               label,
//               tooltip,
//               details,
//               getOptions: (): Promise<OrderedMap<Guid, ValueRecord>> => {
//                 return enumOptionsSources(rendererConfig.options)(unit).then(
//                   (options) =>
//                     OrderedMap(
//                       options.map((o: EnumReference) => [
//                         o.Value,
//                         PredicateValue.Default.record(Map(o)),
//                       ]),
//                     ),
//                 );
//               },
//             };
//           });
//       if (viewKind == "enumMultiSelection" && rendererConfig.kind == "enum")
//         return EnumMultiselectForm<any & FormLabel & BaseEnumContext, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<EnumFormState & Value<OrderedMap<Guid, ValueRecord>>>(
//             (_) => ({
//               ..._,
//               label,
//               details,
//               tooltip,
//               getOptions: (): Promise<OrderedMap<Guid, ValueRecord>> => {
//                 return enumOptionsSources(rendererConfig.options)(unit).then(
//                   (options) =>
//                     OrderedMap(
//                       options.map((o: EnumReference) => [
//                         o.Value,
//                         PredicateValue.Default.record(Map(o)),
//                       ]),
//                     ),
//                 );
//               },
//             }),
//           );
//       if (viewKind == "streamSingleSelection")
//         return SearchableInfiniteStreamForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<
//             any &
//               SearchableInfiniteStreamState &
//               Value<CollectionSelection<CollectionReference>>
//           >((_) => ({ ..._, label, tooltip, details }));
//       if (viewKind == "streamMultiSelection")
//         return InfiniteMultiselectDropdownForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<
//             any &
//               FormLabel &
//               CommonFormState &
//               SearchableInfiniteStreamState &
//               Value<OrderedMap<Guid, CollectionReference>>
//           >((_) => ({
//             ..._,
//             label,
//             tooltip,
//             details,
//           }));
//       if (viewKind == "base64File")
//         return Base64FileForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & FormLabel & CommonFormState & Value<string>>(
//             (_) => ({ ..._, label, tooltip, details }),
//           );
//       if (viewKind == "secret")
//         return SecretForm<any & FormLabel, Unit>()
//           .withView(formViews[viewKind][viewName]())
//           .mapContext<any & FormLabel & CommonFormState & Value<string>>(
//             (_) => ({ ..._, label, tooltip, details }),
//           );
//       // check injectedViews
//       if (injectedPrimitives?.injectedPrimitives.has(viewKind as keyof T)) {
//         //TODO error handling instead of cast
//         const injectedPrimitive = injectedPrimitives.injectedPrimitives.get(
//           viewKind as keyof T,
//         ); //TODO error handling instead of cast
//         return injectedPrimitive?.fieldView(
//           formViews,
//           viewKind,
//           viewName,
//           label,
//           tooltip,
//           details,
//         );
//       }
//       return `error: the view for ${viewKind as string}::${
//         viewName as string
//       } cannot be found`;
//     },
//     FormStates: <T>(
//       viewType: any,
//       viewName: any,
//       InfiniteStreamSources: any,
//       injectedPrimitives?: InjectedPrimitives<T>,
//       stream?: string,
//     ): any => {
//       if (
//         viewType == "unit" ||
//         viewType == "boolean" ||
//         viewType == "number" ||
//         viewType == "string" ||
//         viewType == "base64File" ||
//         viewType == "secret"
//       )
//         return { commonFormState: CommonFormState.Default() };
//       if (injectedPrimitives?.injectedPrimitives.has(viewType)) {
//         const injectedPrimitiveDefaultState =
//           injectedPrimitives.injectedPrimitives.get(viewType)?.defaultState;
//         return injectedPrimitiveDefaultState != undefined
//           ? {
//               customFormState: injectedPrimitiveDefaultState,
//               commonFormState: CommonFormState.Default(),
//             }
//           : { commonFormState: CommonFormState.Default() };
//       }
//       if (viewType == "date") return DateFormState.Default();
//       if (viewType == "enumSingleSelection" || viewType == "enumMultiSelection")
//         return EnumFormState().Default();
//       if (
//         (viewType == "streamSingleSelection" ||
//           viewType == "streamMultiSelection") &&
//         stream != undefined
//       ) {
//         return SearchableInfiniteStreamState().Default(
//           "",
//           (InfiniteStreamSources as any)(stream),
//         );
//       }
//       return `error: the view for ${viewType as string}::${
//         viewName as string
//       } cannot be found when creating the corresponding field form state`;
//     },
//   },
// };
