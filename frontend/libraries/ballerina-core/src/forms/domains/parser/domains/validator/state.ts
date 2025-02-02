import { Set, Map, OrderedMap, List } from "immutable";
import { ApiConverters, BoolExpr, BuiltIns, FieldName, FormsConfigMerger, InjectedPrimitives, isObject, isString, ParsedType, PrimitiveTypeName, RawFieldType, RawType, TypeName } from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

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
  parseRenderer: <T>(fieldType: ParsedType<T>, field: RawRenderer, types: Map<string, ParsedType<T>>): ParsedRenderer<T> => {
      if(fieldType.kind == "primitive")
        return ParsedRenderer.Default.primitive(fieldType, field.renderer, field.visible, field.disabled, field.label, field.tooltip)
      if(fieldType.kind == "form")
        return ParsedRenderer.Default.form(fieldType, field.renderer, field.visible, field.disabled, field.label, field.tooltip)
      if(fieldType.kind == "application" && "options" in field)
        return ParsedRenderer.Default.enum(fieldType, field.renderer, field.visible, field.disabled, field.options, field.label, field.tooltip)
      if(fieldType.kind == "application" && "stream" in field)
        return ParsedRenderer.Default.stream(fieldType, field.renderer, field.visible, field.disabled, field.stream, field.label, field.tooltip)
      if(fieldType.kind == "application" && fieldType.value == "List")
        return ParsedRenderer.Default.list(fieldType, field.renderer, field.visible, field.disabled, ParsedRenderer.Operations.parseRenderer(fieldType.args[0], field.elementRenderer, types), field.label, field.tooltip)
      if(fieldType.kind == "application" && fieldType.value == "Map")
        return ParsedRenderer.Default.map(fieldType, field.renderer, field.visible, field.disabled, ParsedRenderer.Operations.parseRenderer(fieldType.args[0], field.keyRenderer, types), ParsedRenderer.Operations.parseRenderer(fieldType.args[1], field.valueRenderer, types), field.label, field.tooltip)
      if(fieldType.kind == "lookup"){
        return ParsedRenderer.Operations.parseRenderer(types.get(fieldType.name)!, field, types)
      }
      console.error(`Invalid field type ${JSON.stringify(fieldType)} for field ${JSON.stringify(field)}`)
      throw new Error("Invalid field type")
  }
}
}

export type RawForm = {
  type?: any;
  fields?: any;
  tabs?: any;
  header?: any;
}
export const RawForm = {
  hasType: (_: any): _ is { type: any } => isObject(_) && "type" in _,
  hasFields: (_: any): _ is { fields: any } => isObject(_) && "fields" in _,
  hasTabs: (_: any): _ is { tabs: any } => isObject(_) && "tabs" in _,
  hasHeader: (_: any): _ is { header: any } => isObject(_) && "header" in _,
}
export type ParsedFormConfig<T> = {
  name: string;
  // type: TypeName; // TODO should be typename, or just removed and type def used
  type: ParsedType<T>;
  fields: Map<FieldName, ParsedRenderer<T>>;
  tabs: FormLayout;
  header?: string;
};

export type FormLayout = OrderedMap<string, TabLayout>
export type GroupLayout = Array<FieldName>;
export type ColumnLayout = {
  groups: OrderedMap<string, GroupLayout>;
};
export type TabLayout = {
  columns: OrderedMap<string, ColumnLayout>;
};
export type Launcher = {
  name: string,
  kind: "create" | "edit",
  form: string,
  api: string
}

export type RawEntityApi = {
  type?: any;
  methods?: any;
}
export type EntityApi = {
  type: TypeName,
  methods: { create: boolean, get: boolean, update: boolean, default: boolean }
}

export type RawFormJSON = {
  types?: any;
  apis?: any;
  forms?: any;
  launchers?: any;
}
export const RawFormJSON = {
  hasTypes: (_: any): _ is { types: Object } => isObject(_) && "types" in _ && isObject(_.types),
  hasForms: (_: any): _ is { forms: Object } => isObject(_) && "forms" in _ && isObject(_.forms),
  hasApis: (_: any): _ is { apis: { enumOptions: Object; searchableStreams: Object; entities: Object; }} => isObject(_) && "apis" in _ && isObject(_.apis) && "enumOptions" in _.apis && isObject(_.apis.enumOptions) && "searchableStreams" in _.apis && isObject(_.apis.searchableStreams) && "entities" in _.apis && isObject(_.apis.entities), 
  hasLaunchers: (_: any): _ is { launchers: any } => isObject(_) && "launchers" in _,
}
export type ParsedFormJSON<T> = {
  types: Map<TypeName, ParsedType<T>>;
  apis: {
    enums: Map<string, TypeName>;
    streams: Map<string, TypeName>;
    entities: Map<string, EntityApi>;
  };
  forms: Map<string, ParsedFormConfig<T>>;
  launchers: {
    create: Map<string, Launcher>;
    edit: Map<string, Launcher>;
  }
};

export type FormValidationError = string;

export type FormConfigValidationAndParseResult<T> = ValueOrErrors<ParsedFormJSON<T>, FormValidationError>


export const FormsConfig = {
  Default: {
    validateAndParseFormConfig: <T extends {[key in keyof T]: {type: any, state: any}}>(builtIns: BuiltIns, apiConverters: ApiConverters<T>, injectedPrimitives?: InjectedPrimitives<T>) => (fc: any): FormConfigValidationAndParseResult<T> => {
      let errors: List<FormValidationError> = List();
      const formsConfig = Array.isArray(fc) ? FormsConfigMerger.Default.merge(fc) : fc;

      // validation only
      const hasApis = "apis" in formsConfig;
      const apiProps = List(["enumOptions", "searchableStreams", "entities"]);
      const formPropertyChecks = List<[string, boolean]>(
        [
          ['types', "types" in formsConfig],
          ['forms', "forms" in formsConfig],
          ['apis', hasApis],
          ['enumOptions', hasApis && "enumOptions" in formsConfig.apis],
          ['searchableStreams', hasApis && "searchableStreams" in formsConfig.apis],
          ['entities', hasApis && "entities" in formsConfig.apis],
          ['launchers', "launchers" in formsConfig]
        ]
      );

      if (!RawFormJSON.hasTypes(formsConfig) || !RawFormJSON.hasForms(formsConfig) || !RawFormJSON.hasApis(formsConfig) || !RawFormJSON.hasLaunchers(formsConfig)) {
        const formPropertyErrors = formPropertyChecks.filter(([_, hasProp]) => !hasProp)
        .map(([prop, _]) => apiProps.includes(prop) ? 
          `the formsConfig.apis does not contain a '${prop}' field` :
          `the formsConfig does not contain a '${prop}' field`);
        return ValueOrErrors.Default.throw(formPropertyErrors);
      }

      if(injectedPrimitives){
        injectedPrimitives?.injectedPrimitives.keySeq().toArray().some((injectedPrimitiveName) => {
          if(!Object.keys(apiConverters).includes(injectedPrimitiveName as string)){
          errors = errors.push(`the formsConfig does not contain an Api Converter for injected primitive: ${injectedPrimitiveName as string}`);
        }})
      }
      // end

      // Parse Type
      let parsedTypes: Map<TypeName, ParsedType<T>> = Map();
      const rawTypesFromConfig = formsConfig.types;
      const rawTypeNames = Set(Object.keys(rawTypesFromConfig))
      Object.entries(formsConfig.types).forEach(([rawTypeName, rawType]) => {
        // TODO: Parser, should you be able to extend an extended type? probs not, so something for GMs parser
        
        const parsedType: ParsedType<T> = { kind: "form", value: rawTypeName, fields: Map() };
        
        if (!RawType.hasFields(rawType)){
          errors = errors.push(`missing 'fields' in type ${rawTypeName}: expected object`);
          return
        }

        // First check if it is an extended type, we need to resolve these as lookup types
        // TODO: Backwards compatability for CollectionReference
        if (RawType.isMaybeExtendedType(rawType)) 
          if (RawType.isExtendedType<T>(rawType)){
            parsedTypes = parsedTypes.set(rawTypeName, ParsedType.Default.lookup(rawType.extends[0]));
            return
          }
          else{
            errors = errors.push(`invalid 'extends' clause in type ${rawTypeName}: expected string[]`);
            return
          }
           

        Object.entries(rawType.fields).forEach(([rawFieldName, rawFieldType]: [rawFieldName: any, rawFieldType: any]) => {
          if ((RawFieldType.isMaybeLookup(rawFieldType) && !RawFieldType.isPrimitive(rawFieldType, injectedPrimitives)
               && (injectedPrimitives?.injectedPrimitives.has(rawFieldType as keyof T) || (builtIns.primitives.has(rawFieldType))))){
                // TODO fix up injected primitive with operations and now have this doubling or assertion here
                // This validation must be done at runtime, as we need to know the injectedPrimitives and field names
                errors = errors.push(`field ${rawFieldName} in type ${rawTypeName}: fields, injectedPrimitive and builtIns cannot have the same name`); //TODO remind GM of this for BE parser
                return;
          }
          
          const parsedFieldType = ParsedType.Operations.ParseRawFieldType(rawFieldName, rawFieldType, rawTypeNames, injectedPrimitives);
          // TODO whole parser should return a ValueOrErrors so we can use monadic operations
          if(parsedFieldType.kind == "errors"){
            errors = errors.concat(parsedFieldType.errors.toArray());
            return;
          }

          parsedType.fields = parsedType.fields.set(rawFieldName, parsedFieldType.value);
        });
        parsedTypes = parsedTypes.set(rawTypeName, parsedType);
      });

      /// PROBLEM HERE WITH fields typing and not putting all types into the map

      let enums: Map<string, TypeName> = Map();
      Object.entries(formsConfig.apis.enumOptions).forEach(([enumOptionName, enumOption]) => {
        // if (!parsedTypes.has(enumOption)) {
        //   errors = errors.push(`formsConfig.apis.enumOptions: ${enumOptionName} refers to non-existent type ${enumOption}`);
        // } else {
          enums = enums.set(enumOptionName, enumOption)
        // }
      })

      // parse streams
      let streams: Map<string, TypeName> = Map();
      Object.entries(formsConfig.apis.searchableStreams).forEach(([searchableStreamName, searchableStream]) => {
        // if (!parsedTypes.has(searchableStream)) {
        //   errors = errors.push(`formsConfig.apis.searchableStreams: ${searchableStreamName} refers to non-existent type ${searchableStream}`);
        // } else {
          streams = streams.set(searchableStreamName, searchableStream)
        // }
      })
      // end

      // parse entities
      let entities: Map<string, EntityApi> = Map();
      Object.entries(formsConfig.apis.entities).forEach(([entityApiName, entityApi]: [entiyApiName: string, entityApi: RawEntityApi ]) => {
        if(!("type" in entityApi)){
          errors = errors.push(`formsConfig.apis.entities.${entityApiName} is missing the required 'type' attribute`);
          return
        }
        if(!isString(entityApi.type)){
          errors = errors.push(`formsConfig.apis.entities.${entityApiName}.type is not a string`);
          return
        }
        if(!("methods" in entityApi)){
          errors = errors.push(`formsConfig.apis.entities.${entityApiName} is missing the required 'methods' attribute`);
          return
        }
        if(!Array.isArray(entityApi.methods)){
          errors = errors.push(`formsConfig.apis.entities.${entityApiName}.methods is not an array`);
          return
        }
        // if (!parsedTypes.has(entityApi.type)) {
        //   errors = errors.push(`formsConfig.apis.entities refers to non-existent type ${entityApi.type}`);
        // }

        entities = entities.set(entityApiName, {
          type: entityApi.type,
          methods: {
            create: entityApi.methods.includes("create"),
            get: entityApi.methods.includes("get"),
            update: entityApi.methods.includes("update"),
            default: entityApi.methods.includes("default"),
          }
        })
        
      })
      // end
  

      // parse forms
      let forms: Map<string, ParsedFormConfig<T>> = Map();
      Object.entries(formsConfig.forms).forEach(([formName, form]: [formName: string, form: RawForm]) => {
        if(!RawForm.hasType(form)){
          errors = errors.push(`form ${formName} is missing the required 'type' attribute`);
          return
        }
        if (!parsedTypes.has(form.type)) {
          errors = errors.push(`form ${formName} references non-existing type ${form.type}`);
          return
        }
        if(!RawForm.hasFields(form)){
          errors = errors.push(`form ${formName} is missing the required 'fields' attribute`);
          return
        }
        if(!RawForm.hasTabs(form)){
          errors = errors.push(`form ${formName} is missing the required 'tabs' attribute`);
          return
        }
        
        const parsedForm: ParsedFormConfig<T> = { name: formName, fields: Map(), tabs: Map(), type: parsedTypes.get(form.type)!, header: RawForm.hasHeader(form) ? form.header : undefined };

        const formType = parsedTypes.get(form.type)!
        if(formType.kind != "form"){
          errors = errors.push(`form ${formName} references non-form type ${form.type}`);
          return
        }
        
        // parse fields
        Object.entries(form.fields).forEach(([fieldName, field]: [fieldName: string, field: any]) =>
          parsedForm.fields = parsedForm.fields.set(fieldName, ParsedRenderer.Operations.parseRenderer(formType.fields.get(fieldName)!, field, parsedTypes))         
        )

        // parse tabs
        let tabs: FormLayout = OrderedMap()
        Object.entries(form.tabs).forEach(([tabName, tab]: [tabName: string, tab: any]) => {
            let cols: TabLayout = { columns: OrderedMap() }
            tabs = tabs.set(tabName, cols)
            Object.entries(tab.columns).forEach(([colName, col]: [colName:string, col: any]) => {
                let column: ColumnLayout = { groups: OrderedMap() }
                cols.columns = cols.columns.set(colName, column)
                Object.keys(col.groups).forEach(groupName => {
                  const groupConfig = col.groups[groupName]
                  let group: GroupLayout = []
                  column.groups = column.groups.set(groupName, group)
                    groupConfig.forEach((fieldName: any) => {
                        group.push(fieldName)
                    })
                })
            })
        })
        parsedForm.tabs = tabs
        forms = forms.set(formName, parsedForm);
      })

      let launchers: ParsedFormJSON<T>["launchers"] = {
        create: Map<string, Launcher>(),
        edit: Map<string, Launcher>(),
      }
      Object.keys(formsConfig["launchers"]).forEach((launcherName: any) => {
        const launcherKinds = ["create", "edit"]
        if (launcherKinds.includes(formsConfig["launchers"][launcherName]["kind"]) == false) {
          errors = errors.push(`launcher '${launcherName}' has invalid 'kind': expected any of ${JSON.stringify(launcherKinds)}`);
          return
        }
        if (forms.has(formsConfig["launchers"][launcherName]["form"]) == false) {
          errors = errors.push(`launcher '${launcherName}' references non-existing form '${formsConfig.launchers[launcherName].form}'`);
          return
        }
        const form = forms.get(formsConfig["launchers"][launcherName]["form"])!
        
        if (entities.has(formsConfig["launchers"][launcherName]["api"]) == false) {
          errors = errors.push(`launcher '${launcherName}' references non-existing entity api '${formsConfig.launchers[launcherName].api}'`);
          return
        }
        const api = entities.get(formsConfig["launchers"][launcherName]["api"])!
        if (form.type.kind == "application" && form.type.value != api.type)
          errors = errors.push(`form and api in launcher '${launcherName}' reference different types '${form.type}' and '${api.type}'`);
        if (formsConfig["launchers"][launcherName]["kind"] == "create" &&
          !(api.methods.create && api.methods.default)
        )
          errors = errors.push(`launcher '${launcherName}' requires api methods 'create' and 'default'`);
        if (formsConfig["launchers"][launcherName]["kind"] == "edit" &&
          !(api.methods.get && api.methods.update)
        )
          errors = errors.push(`launcher '${launcherName}' requires api methods 'get' and 'update'`);
        let launcher: Launcher = {
          name: launcherName,
          kind: formsConfig["launchers"][launcherName]["kind"],
          form: formsConfig["launchers"][launcherName]["form"],
          api: formsConfig["launchers"][launcherName]["api"],
        };
        if (launcher.kind == "create")
          launchers.create = launchers.create.set(launcherName, launcher)
        else
          launchers.edit = launchers.edit.set(launcherName, launcher)
      })

      if (errors.size > 0) {
        console.error("parsing errors")
        console.error(errors)
        return ValueOrErrors.Default.throw(errors);
      }

      return ValueOrErrors.Default.return({
        types: parsedTypes,
        forms,
        apis: {
          enums: enums,
          streams: streams,
          entities: entities,
        },
        launchers
      });
    }
  }
}