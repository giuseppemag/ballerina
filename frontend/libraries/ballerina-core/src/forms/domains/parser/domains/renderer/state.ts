import { List, Map, OrderedMap, Set } from "immutable";
import { Base64FileForm, BaseEnumContext, BasicFun, BooleanForm, BoolExpr, CollectionReference, CollectionSelection, CommonFormState, DateForm, DateFormState, EnumForm, EnumFormState, EnumMultiselectForm, EnumOptionsSources, FormLabel, Guid, InfiniteMultiselectDropdownForm, InjectedPrimitives, ListFieldState, ListForm, MapFieldState, MapForm, Maybe, MaybeBooleanForm, NumberForm, ParsedForms, ParsedType, SearchableInfiniteStreamForm, SearchableInfiniteStreamState, SecretForm, StringForm, Template, Unit, Value } from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

type Form = {
  renderer: Template<any, any, any, any>,
  initialValue: any,
  initialState: any
}
export type RawRenderer = {
    renderer?: any;
    label?: any;
    tooltip?: any;
    visible?: any;
    disabled?: any;
    stream?: any;
    options?: any;
    elementRenderer?: any;
    keyRenderer?: any;
    valueRenderer?: any;
  }
export type ParsedRenderer<T> = 
  (
  | { kind: "primitive"; }
  | { kind: "form"; }
  | { kind: "enum"; options: string; }
  | { kind: "stream"; stream: string; }
  | { kind: "list"; elementRenderer: ParsedRenderer<T>; }
  | { kind: "map"; keyRenderer: ParsedRenderer<T>; valueRenderer: ParsedRenderer<T>; }
  ) & { renderer: string;
        type: ParsedType<T>
        label?: string;
        tooltip?: string;
        visible?: BoolExpr<any>;
        disabled?: BoolExpr<any>; 
    }
export const ParsedRenderer = {
  Default: {
    primitive: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "primitive",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
    }),
    form: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "form",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
    }),
    enum: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, options: string, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "enum",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
      options
    }),
    stream: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, stream: string, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "stream",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
      stream
    }),
    list: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, elementRenderer: ParsedRenderer<T>, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "list",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
      elementRenderer
    }),
    map: <T>(type: ParsedType<T>, renderer: string, visible: any, disabled: any, keyRenderer: ParsedRenderer<T>, valueRenderer: ParsedRenderer<T>, label?: string, tooltip?: string ): ParsedRenderer<T> => ({
      kind: "map",
      type,
      renderer,
      label,
      tooltip,
      visible: BoolExpr.Default(visible),
      disabled: disabled != undefined ?
        BoolExpr.Default(disabled)
        : BoolExpr.Default.false(),
      keyRenderer,
      valueRenderer
    }),
  },
  Operations: {
    ParseRenderer: <T>(fieldType: ParsedType<T>, field: RawRenderer, types: Map<string, ParsedType<T>>): ParsedRenderer<T> => {
      if(fieldType.kind == "primitive")
        return ParsedRenderer.Default.primitive(fieldType, field.renderer, field.visible, field.disabled, field.label, field.tooltip)
      if(fieldType.kind == "form")
        return ParsedRenderer.Default.form(fieldType, field.renderer, field.visible, field.disabled, field.label, field.tooltip)
      if(fieldType.kind == "application" && "options" in field)
        return ParsedRenderer.Default.enum(fieldType, field.renderer, field.visible, field.disabled, field.options, field.label, field.tooltip)
      if(fieldType.kind == "application" && "stream" in field)
        return ParsedRenderer.Default.stream(fieldType, field.renderer, field.visible, field.disabled, field.stream, field.label, field.tooltip)
      if(fieldType.kind == "application" && fieldType.value == "List")
        return ParsedRenderer.Default.list(fieldType, field.renderer, field.visible, field.disabled, ParsedRenderer.Operations.ParseRenderer(fieldType.args[0], field.elementRenderer, types), field.label, field.tooltip)
      if(fieldType.kind == "application" && fieldType.value == "Map")
        return ParsedRenderer.Default.map(fieldType, field.renderer, field.visible, field.disabled, ParsedRenderer.Operations.ParseRenderer(fieldType.args[0], field.keyRenderer, types), ParsedRenderer.Operations.ParseRenderer(fieldType.args[1], field.valueRenderer, types), field.label, field.tooltip)
      if(fieldType.kind == "lookup"){
        return ParsedRenderer.Operations.ParseRenderer(types.get(fieldType.name)!, field, types)
      }
      console.error(`Invalid field type ${JSON.stringify(fieldType)} for field ${JSON.stringify(field)}`)
      throw new Error("Invalid field type")
    },
    ParseOptions: (leafPredicates: any, options: any) => {
      const result = options.map((_: any) => ([_[0].id, [_[0], (_[1] as BoolExpr<any>).eval<any>(leafPredicates)]]));
      const resultMap = result.reduce((a: any, b: any) => a.set(b[0], b[1]), OrderedMap<any, any>());
      return resultMap;
    },
    FormViewToViewKind: (viewName: string | undefined, formViews: Record<string, any>, formNames: Set<string>) => {
      if (viewName == undefined) {
        throw Error(`cannot resolve view ${viewName}`) // TODO -- better error handling
      }
      if(formNames.has(viewName)){
        return "form";
      }
      const viewTypes = Object.keys(formViews) 
      for (const viewType of viewTypes) {
        if (viewName in formViews[viewType]) {
          return viewType;
        }
      }
      throw Error(`cannot resolve view ${viewName}`) // TODO -- better error handling
    },
    RendererToForm: <T,>(parsingContext: { formViews: Record<string, Record<string, any>>, forms: ParsedForms<T>, nestedContainerFormView: any, defaultValue: BasicFun<ParsedType<T>, any>, enumOptionsSources: EnumOptionsSources, infiniteStreamSources: any, leafPredicates: any, injectedPrimitives?: InjectedPrimitives<T> },
      parsedRenderer: ParsedRenderer<T>): ValueOrErrors<Form, string> => {
        
      const viewKind = ParsedRenderer.Operations.FormViewToViewKind(parsedRenderer.renderer, parsingContext.formViews, parsingContext.forms.keySeq().toSet())
    
      switch (parsedRenderer.kind) {
        case "primitive":
        case "enum":
        case "stream":
          return ValueOrErrors.Default.return({
            renderer: ParsedRenderer.Operations.FormRenderers(parsedRenderer, parsingContext.formViews, viewKind, parsedRenderer.renderer, parsedRenderer.label, parsedRenderer.tooltip, parsingContext.enumOptionsSources, parsingContext.leafPredicates, parsingContext.injectedPrimitives),
            initialValue: parsingContext.defaultValue(parsedRenderer.type),
            initialState: ParsedRenderer.Operations.FormStates(parsedRenderer, viewKind, parsedRenderer.renderer, parsingContext.infiniteStreamSources, parsingContext.injectedPrimitives)
          })
        case "form":
          return ValueOrErrors.Default.return({
              renderer: parsingContext.forms.get(parsedRenderer.renderer)!.form.withView(parsingContext.nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: parsedRenderer.label, tooltip: parsedRenderer.tooltip })),
              initialValue: parsingContext.defaultValue(parsedRenderer.type),
              initialState: parsingContext.forms.get(parsedRenderer.renderer)!.initialFormState
          })
        case "list":
            return ParsedRenderer.Operations.RendererToForm(parsingContext, parsedRenderer.elementRenderer).Then(parsedElementRenderer => 
                    ValueOrErrors.Default.return({renderer: ListForm<any, any, any & FormLabel, Unit>(
                      { Default: () => parsedElementRenderer.initialState },
                      { Default: () => parsedElementRenderer.initialValue },
                      parsedElementRenderer.renderer,
                    ).withView(((parsingContext.formViews)[viewKind])[parsedRenderer.renderer]() as any)
                      .mapContext<any>(_ => ({ ..._, label: parsedRenderer.label, tooltip: parsedRenderer.tooltip })),
                        initialValue: parsingContext.defaultValue(parsedRenderer.type),
                        initialState: ListFieldState<any, any>().Default(Map())
                      })
            )
        case "map":
            return ParsedRenderer.Operations.RendererToForm(parsingContext, parsedRenderer.keyRenderer).Then(parsedKeyRenderer =>
                    ParsedRenderer.Operations.RendererToForm(parsingContext, parsedRenderer.valueRenderer).Then(parsedValueRenderer => 
                      ValueOrErrors.Default.return({renderer: MapForm<any, any, any, any, any & FormLabel, Unit>(
                        { Default: () => parsedKeyRenderer.initialState },
                        { Default: () => parsedValueRenderer.initialState },
                        { Default: () => parsedKeyRenderer.initialValue },
                        { Default: () => parsedValueRenderer.initialValue },
                        parsedKeyRenderer.renderer,
                        parsedValueRenderer.renderer
                      ).withView(((parsingContext.formViews)[viewKind])[parsedRenderer.renderer]() as any)
                        .mapContext<any>(_ => ({ ..._, label: parsedRenderer.label, tooltip: parsedRenderer.tooltip })),
                        initialValue: parsingContext.defaultValue(parsedRenderer.type),
                        initialState: MapFieldState<any, any, any, any>().Default(Map())
                      })
                    )
              )
        default:
          return ValueOrErrors.Default.throw(List([`error: the kind for ${viewKind}::${parsedRenderer} cannot be found`]));
      }
    },
    FormRenderers: <T,>(rendererConfig: ParsedRenderer<T>, formViews: Record<string, Record<string, any>>, viewKind: string, viewName: any, label: string | undefined, tooltip: string | undefined, enumOptionsSources: EnumOptionsSources, leafPredicates: any, injectedPrimitives?: InjectedPrimitives<T>): any => {
      if (viewKind == "maybeBoolean")
        return MaybeBooleanForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip }))
      if (viewKind == "boolean")
        return BooleanForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip }))
      if (viewKind == "date")
        return DateForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & DateFormState & Value<Maybe<Date>>>(_ => ({ ..._, label: label, tooltip }))
      if (viewKind == "number")
        return NumberForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & CommonFormState & Value<number>>(_ => ({ ..._, label: label, tooltip }))
      if (viewKind == "string")
        return StringForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip }))
      if (viewKind == "enumSingleSelection" && rendererConfig.kind == "enum")
        return EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
          .withView(formViews[viewKind][viewName]())
          .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
            ..._, label: label, tooltip, getOptions: () => {
              return ((enumOptionsSources as any)(rendererConfig.options)() as Promise<any>).then(options => ParsedRenderer.Operations.ParseOptions(leafPredicates, options))
            }
          })) 
      if (viewKind == "enumMultiSelection" && rendererConfig.kind == "enum")
        return EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
          .withView(formViews[viewKind][viewName]() )
          .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
            ..._, label: label, tooltip, getOptions: () => ((enumOptionsSources as any)(rendererConfig.options)() as Promise<any>).then(options => ParsedRenderer.Operations.ParseOptions(leafPredicates, options))
          })) 
      if (viewKind == "streamSingleSelection")
        return SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]() )
          .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) 
      if (viewKind == "streamMultiSelection")
        return InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]() )
          .mapContext<any & FormLabel & CommonFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) 
      if (viewKind == "base64File")
        return Base64FileForm<any & FormLabel, Unit>()
        .withView(((formViews )[viewKind] )[viewName]() )
          .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) 
      if (viewKind == "secret")
        return SecretForm<any & FormLabel, Unit>()
          .withView(formViews[viewKind][viewName]() )
          .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) 
      // check injectedViews
      if (injectedPrimitives?.injectedPrimitives.has(viewKind as keyof T)) { //TODO error handling instead of cast
        const injectedPrimitive = injectedPrimitives.injectedPrimitives.get(viewKind as keyof T) //TODO error handling instead of cast
        return injectedPrimitive?.fieldView(formViews, viewKind, viewName, label, tooltip) 
      }
      return `error: the view for ${viewKind as string}::${viewName as string} cannot be found`;
    },
    FormStates: <T,>(renderer: ParsedRenderer<T>, viewType: any, viewName: any, InfiniteStreamSources: any, injectedPrimitives?: InjectedPrimitives<T>): any => {
      if (viewType == "maybeBoolean" || viewType == "boolean" || viewType == "number" || viewType == "string" || viewType == "base64File" || viewType == "secret")
        return {commonFormState: CommonFormState.Default()};
      if( injectedPrimitives?.injectedPrimitives.has(viewType)){
        const injectedPrimitiveDefaultState = injectedPrimitives.injectedPrimitives.get(viewType)?.defaultState;
        return injectedPrimitiveDefaultState != undefined ?
        ({
          customFormState: injectedPrimitiveDefaultState,
          commonFormState: CommonFormState.Default()
        }) : {commonFormState: CommonFormState.Default()};
      }
      if (viewType == "date")
        return DateFormState.Default();
      if (viewType == "enumSingleSelection" || viewType == "enumMultiSelection")
        return EnumFormState<any, any>().Default();
      if ((viewType == "streamSingleSelection" || viewType == "streamMultiSelection") && renderer.kind == "stream") {
        return SearchableInfiniteStreamState<any>().Default("", (InfiniteStreamSources as any)(renderer.stream));
      }
      return `error: the view for ${viewType as string}::${viewName as string} cannot be found when creating the corresponding field form state`;
    },
  }
}