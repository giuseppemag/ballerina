import { Set, Map, OrderedMap, List } from "immutable";
import { ApiConverters, BoolExpr, BuiltIns, FieldName, FormsConfigMerger, InjectedPrimitives, Type, TypeDefinition, TypeName } from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

export type FieldConfig = {
  renderer: string;
  label?: string;
  tooltip?: string;
  api: { stream?: string, enumOptions?: string };
  elementRenderer?: string | FieldConfig;
  elementLabel?: string;
  elementTooltip?: string;
  mapRenderer?: { keyRenderer: FieldConfig, valueRenderer: FieldConfig };
  visible: BoolExpr<any>;
  disabled: BoolExpr<any>;
};
export type FormDef = {
  name: string;
  type: TypeName;
  typeDef: TypeDefinition;
  fields: Map<FieldName, FieldConfig>;
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
export type EntityApi = {
  type: TypeName,
  methods: { create: boolean, get: boolean, update: boolean, default: boolean }
}
export type FormsConfig = {
  types: Map<TypeName, TypeDefinition>;
  forms: Map<string, FormDef>;
  apis: {
    enums: Map<string, TypeName>;
    streams: Map<string, TypeName>;
    entities: Map<string, EntityApi>;
  };
  launchers: {
    create: Map<string, Launcher>;
    edit: Map<string, Launcher>;
  }
};
export type FormValidationError = string;


export type FormConfigValidationAndParseResult = ValueOrErrors<FormsConfig, FormValidationError>
export const FormsConfig = {
  Default: {
    validateAndParseFormConfig: <T extends {[key in keyof T]: {type: any, state: any}}>(builtIns: BuiltIns, apiConverters: ApiConverters<T>, injectedPrimitives?: InjectedPrimitives<T>) => (fc: any): FormConfigValidationAndParseResult => {
      let errors: List<FormValidationError> = List();
      const formsConfig = Array.isArray(fc) ? FormsConfigMerger.Default.merge(fc) : fc;
      
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

      if(formPropertyChecks.some(([_, hasProp]) => !hasProp)){
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

      let types: Map<TypeName, TypeDefinition> = Map();
      Object.keys(formsConfig["types"]).forEach((typeName: any) => {
        let typeDef: TypeDefinition = { name: typeName, extends: [], fields: OrderedMap() };
        types = types.set(typeName, typeDef);
        const configTypeDef = formsConfig["types"][typeName];
        if ("extends" in configTypeDef) {
          if (Array.isArray(configTypeDef["extends"]) && configTypeDef["extends"].every(_ => typeof (_) == "string"))
            typeDef.extends.push(...configTypeDef["extends"]);

          else
            errors = errors.push(`invalid 'extends' clause in type ${typeName}: expected string[]`);
        }
        if ("fields" in configTypeDef == false)
          errors = errors.push(`missing 'fields' in type ${typeName}: expected object`);

        Object.keys(configTypeDef["fields"]).forEach((fieldName: any) => {
          let configFieldType = configTypeDef["fields"][fieldName];
          if (typeof configFieldType == "string") {
            if (injectedPrimitives?.injectedPrimitives.has(configFieldType as keyof T) && 
            (builtIns.primitives.has(configFieldType) || builtIns.generics.has(configFieldType))) {
              errors = errors.push(`field ${fieldName} in type ${typeName}: injectedPrimitive cannot have same name as builtIn primitive`);
            } else {
              if (builtIns.primitives.has(configFieldType) || injectedPrimitives?.injectedPrimitives.has(configFieldType as keyof T))
                typeDef.fields = typeDef.fields.set(fieldName, { kind: "primitive", value: configFieldType as any });
              else
                typeDef.fields = typeDef.fields.set(fieldName, { kind: "lookup", name: configFieldType as any })
            }
          } else if (typeof configFieldType == "object") {
            if ("fun" in configFieldType && "args" in configFieldType &&
              typeof configFieldType["fun"] == "string" &&
              Array.isArray(configFieldType["args"]) 
            ) {
              const args = configFieldType["fun"] == "Map" ? 
                configFieldType["args"].map((arg:any) => (typeof arg == "string" ? arg : { kind:"application", value: arg.fun, args: arg.args })) as any :
                configFieldType["args"] as any;
              const fieldType: Type = {
                kind: "application",
                value: configFieldType["fun"] as any,
                args,
              }
              typeDef.fields = typeDef.fields.set(fieldName, fieldType);
            }
            else
              errors = errors.push(`field ${fieldName} in type ${typeName}: expected application, found ${JSON.stringify(configFieldType)}`);
          }
        });
      });

      types.forEach((typeDef, typeName) => {
        typeDef.extends.forEach(extendedTypeName => {
          if ((!builtIns.primitives.has(extendedTypeName) && !injectedPrimitives?.injectedPrimitives.has(extendedTypeName as keyof T)) && !types.has(extendedTypeName))
            errors = errors.push(`type ${typeName} extends non-existent type ${extendedTypeName}`);
        });
        typeDef.fields.forEach((fieldDef, fieldName) => {
          if (fieldDef.kind == "primitive" && (!builtIns.primitives.has(fieldDef.value) && !injectedPrimitives?.injectedPrimitives.has(fieldDef.value as keyof T) ))
            errors = errors.push(`field ${fieldName} of type ${typeName} is non-existent primitive type ${fieldDef.value}`);
          if (fieldDef.kind == "lookup" && !types.has(fieldDef.name))
            errors = errors.push(`field ${fieldName} of type ${typeName} is non-existent type ${fieldDef.name}`);
          if (fieldDef.kind == "application" && fieldDef.value == "SingleSelection") {
            if (fieldDef.args.length != 1)
              errors = errors.push(`field ${fieldName} in type ${typeName}: SingleSelection should have exactly one type argument, found ${JSON.stringify(fieldDef.args)}`);
            else {
              const argType = types.get(fieldDef.args[0])!
              if(argType == undefined){
                errors = errors.push(`arg ${fieldDef.args[0]} in type ${typeName} references non existent type`);
                return
              }
              if (argType.extends.length != 1 || (argType.extends[0] != "CollectionReference" && !types.has(argType.extends[0])))
                errors = errors.push(`field ${fieldName} in type ${typeName}: SingleSelection requires ${argType.name} to extend ${argType.extends[0]}`);
            }
          }
          if (fieldDef.kind == "application" && fieldDef.value == "Multiselection") {
            if (fieldDef.args.length != 1)
              errors = errors.push(`field ${fieldName} in type ${typeName}: Multiselection should have exactly one type argument, found ${JSON.stringify(fieldDef.args)}`);
            else {
              const argType = types.get(fieldDef.args[0])!
              if(argType == undefined){
                errors = errors.push(`arg ${fieldDef.args[0]} in type ${typeName} references non existent type`);
                return errors
              }
              if (argType.extends.length != 1 || (argType.extends[0] != "CollectionReference" && !types.has(argType.extends[0])))
                errors = errors.push(`field ${fieldName} in type ${typeName}: Multiselection requires ${argType.name} to extend ${argType.extends[0]}`);
            }
          }
          if (fieldDef.kind == "application" && fieldDef.value == "List") {
            if (fieldDef.args.length != 1)
              errors = errors.push(`field ${fieldName} in type ${typeName}: List should have exactly one type argument, found ${JSON.stringify(fieldDef.args)}`)
          }
          if (fieldDef.kind == "application" && fieldDef.value == "Map") {
            if (fieldDef.args.length != 2)
              errors = errors.push(`field ${fieldName} in type ${typeName}: Map should have exactly two type arguments, found ${JSON.stringify(fieldDef.args)}`)
          }
        });
      });

      let enums: Map<string, TypeName> = Map();
      Object.keys(formsConfig["apis"]["enumOptions"]).forEach((enumOptionsName: any) => {
        if (!types.has(formsConfig["apis"]["enumOptions"][enumOptionsName])) {
          errors = errors.push(`formsConfig.apis.enumOptions refers to non-existent type ${formsConfig['apis']['enumOptions'][enumOptionsName]}`);
        } else {
          enums = enums.set(enumOptionsName, formsConfig["apis"]["enumOptions"][enumOptionsName])
        }
      })

      let streams: Map<string, TypeName> = Map();
      Object.keys(formsConfig["apis"]["searchableStreams"]).forEach((searchableStreamName: any) => {
        if (!types.has(formsConfig["apis"]["searchableStreams"][searchableStreamName])) {
          errors = errors.push(`formsConfig.apis.searchableStreams refers to non-existent type ${formsConfig['apis']['searchableStreams'][searchableStreamName]}`);
        } else {
          streams = streams.set(searchableStreamName, formsConfig["apis"]["searchableStreams"][searchableStreamName])
        }
      })

      let entities: Map<string, EntityApi> = Map();
      Object.keys(formsConfig["apis"]["entities"]).forEach((entityApiName: any) => {
        const entityApiConfig = formsConfig["apis"]["entities"][entityApiName]
        if (!types.has(formsConfig["apis"]["entities"][entityApiName]["type"])) {
          errors = errors.push(`formsConfig.apis.entities refers to non-existent type ${formsConfig['apis']['entities'][entityApiName]["type"]}`);
        } else {
          entities = entities.set(entityApiName, {
            type: entityApiConfig["type"],
            methods: {
              create: entityApiConfig["methods"].includes("create"),
              get: entityApiConfig["methods"].includes("get"),
              update: entityApiConfig["methods"].includes("update"),
              default: entityApiConfig["methods"].includes("default"),
            }
          })
        }
      })

      let forms: Map<string, FormDef> = Map();
      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef: FormDef = { name: formName, type: "", fields: Map(), tabs: Map(), typeDef: null! };
        forms = forms.set(formName, formDef);
        const configFormDef = formsConfig["forms"][formName];
        if ("type" in configFormDef == false) {
          errors = errors.push(`form ${formName} is missing the required 'type' attribute`);
        } else {
          if (types.has(configFormDef["type"])) {
            formDef.type = configFormDef["type"];
            formDef.typeDef = types.get(configFormDef["type"])!
          } else
            errors = errors.push(`form ${formName} references non-existing type ${configFormDef["type"]}`);
        }
        const formTypeDef = types.get(configFormDef["type"])
        if ("fields" in configFormDef == false) {
          errors = errors.push(`form ${formName} is missing the required 'fields' attribute`);
        } else {
          formTypeDef?.fields.forEach((fieldType, fieldName) => {
            if (!Object.keys(configFormDef["fields"]).includes(fieldName))
              errors = errors.push(`form ${formName} is missing a renderer for field ${fieldName} which is defined on type ${formDef.type}`);
          })
          Object.keys(configFormDef["fields"]).forEach(fieldName => {
            const fieldConfig = configFormDef["fields"][fieldName]
            if (!formTypeDef?.fields.has(fieldName)) {
              errors = errors.push(`form ${formName} references field ${fieldName} which does not exist on type ${formDef.type}`);
            } else {
              if ("renderer" in fieldConfig == false) {
                errors = errors.push(`field ${fieldName} of form ${formName} has no 'renderer' attribute`);
              }
              const fieldTypeDef = formTypeDef?.fields.get(fieldName)
              if (!fieldTypeDef)
                errors = errors.push(`field ${fieldName} of form ${formName} has no corresponding type `);
            }
          })
        }
      })

      const rendererMatchesType = (formName:string, fieldName:string) => (fieldTypeDef:Type, fieldConfig:any) => {
        if (fieldTypeDef?.kind == "primitive") {
          if(injectedPrimitives?.injectedPrimitives.has(fieldTypeDef.value as keyof T)){
            if (!injectedPrimitives.renderers[fieldTypeDef.value as keyof T].has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing injected primitive 'renderer' ${fieldConfig["renderer"]}`);
          }
          else if (fieldTypeDef.value == "maybeBoolean") {
            if (!builtIns.renderers.maybeBoolean.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef.value == "boolean") {
            if (!builtIns.renderers.boolean.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef.value == "number") {
            if (!builtIns.renderers.number.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef.value == "string") {
            if (!builtIns.renderers.string.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef.value == "Date") {
            if (!builtIns.renderers.date.has(fieldConfig["renderer"])) {
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
            }
          } else {
            errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          }
          if(injectedPrimitives?.injectedPrimitives.has(fieldTypeDef.value as keyof T)){
            if (!injectedPrimitives.renderers[fieldTypeDef.value as keyof T].has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing injected primitive 'renderer' ${fieldConfig["renderer"]}`);
          }
        } else if (fieldTypeDef?.kind == "application") {
          if (fieldTypeDef?.value == "SingleSelection") {
            if (!builtIns.renderers.enumSingleSelection.has(fieldConfig["renderer"]) &&
              !builtIns.renderers.streamSingleSelection.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef?.value == "Multiselection") {
            if (!builtIns.renderers.enumMultiSelection.has(fieldConfig["renderer"]) &&
              !builtIns.renderers.streamMultiSelection.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
          } else if (fieldTypeDef?.value == "List") {
            if (!builtIns.renderers.list.has(fieldConfig["renderer"]) ){
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`)
            }
          } else if (fieldTypeDef?.value == "Map") {
            if (!builtIns.renderers.map.has(fieldConfig["renderer"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
            if ("keyRenderer" in fieldConfig != true || "valueRenderer" in fieldConfig != true)
              errors = errors.push(`field ${fieldName} of form ${formName} must have both a keyRenderer and a valueRenderer`);
            if (fieldTypeDef.args.length != 2)
              errors = errors.push(`field ${fieldName} of form ${formName} should have exactly two type arguments`);
            else {
              const typeDefToType = (typeDef:any) : Type | undefined =>
                "kind" in typeDef == false ? undefined
              : "value" in typeDef == false ? undefined
              : "args" in typeDef == false ? undefined
              : Array.isArray(typeDef.args) == false ? undefined
              :  Type.Default.application(typeDef.fun, typeDef.args.map((arg:any) => (typeof arg == "string" ? arg : { kind:"application", value: arg.fun, args: arg.args })) as any)
              const keyType:Type | undefined = typeof fieldTypeDef.args[0] == "string" ? Type.Operations.FromName(types, builtIns, injectedPrimitives)(fieldTypeDef.args[0]) : typeDefToType(fieldTypeDef.args[0] as any)
              const valueType:Type | undefined = typeof fieldTypeDef.args[1] == "string" ? Type.Operations.FromName(types, builtIns, injectedPrimitives)(fieldTypeDef.args[1]) : typeDefToType(fieldTypeDef.args[1] as any)
              if (!keyType) {
                errors = errors.push(`field ${fieldName} of form ${formName} references non-existing key type ${JSON.stringify(fieldTypeDef.args[0])}`);
              } else if (!valueType) {
                errors = errors.push(`field ${fieldName} of form ${formName} references non-existing value type ${JSON.stringify(fieldTypeDef.args[1])}`);
              } else {
                rendererMatchesType(formName, fieldName)(keyType, fieldConfig.keyRenderer)
                rendererMatchesType(formName, fieldName)(valueType, fieldConfig.valueRenderer)
              }
            }
          }
          if (fieldTypeDef.args.length < 1)
            errors = errors.push(`field ${fieldName} of form ${formName} should have one type argument}`);
          else if (
            (builtIns.renderers.list.has(fieldConfig["renderer"])) && "elementRenderer" in fieldConfig != true)
            errors = errors.push(`field ${fieldName} of form ${formName} is missing the 'elementRenderer' property`);
          else if (
            (builtIns.renderers.enumMultiSelection.has(fieldConfig["renderer"]) ||
              builtIns.renderers.enumSingleSelection.has(fieldConfig["renderer"])) && "options" in fieldConfig != true)
            errors = errors.push(`field ${fieldName} of form ${formName} is missing the 'options' property`);
          else if (
            (builtIns.renderers.streamSingleSelection.has(fieldConfig["renderer"]) ||
              builtIns.renderers.streamMultiSelection.has(fieldConfig["renderer"])) && "stream" in fieldConfig != true)
            errors = errors.push(`field ${fieldName} of form ${formName} is missing the 'stream' property`);
          else if ((builtIns.renderers.enumMultiSelection.has(fieldConfig["renderer"]) ||
            builtIns.renderers.enumSingleSelection.has(fieldConfig["renderer"])) && (enums.get(fieldConfig["options"])) != fieldTypeDef.args[0]) {
            if (enums.has(fieldConfig["options"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references an enum api with type ${enums.get(fieldConfig["options"])} when ${fieldTypeDef.args[0]} was expected`);
            else
              errors = errors.push(`field ${fieldName} of form ${formName} references a non-existing enum api`);
          } else if ((builtIns.renderers.streamMultiSelection.has(fieldConfig["renderer"]) ||
            builtIns.renderers.streamSingleSelection.has(fieldConfig["renderer"])) && (streams.get(fieldConfig["stream"])) != fieldTypeDef.args[0]) {
            if (streams.has(fieldConfig["stream"]))
              errors = errors.push(`field ${fieldName} of form ${formName} references an api with type ${streams.get(fieldConfig["stream"])} when ${fieldTypeDef.args[0]} was expected`);
            else
              errors = errors.push(`field ${fieldName} of form ${formName} references a non-existing stream api`);
          }
        } else {
          const formTypeDef = types.get(fieldTypeDef.name)
          if (!formTypeDef) {
            errors = errors.push(`field ${fieldName} of form ${formName} references a non-existing type ${fieldTypeDef.name}`);
          } else {
            const form = forms.get(fieldConfig.renderer ?? "")
            if (!form) {
              errors = errors.push(`field ${fieldName} of form ${formName} references non-existing form ${fieldConfig.renderer}`);
            } else if (fieldTypeDef.name != form.typeDef.name) {
              errors = errors.push(`field ${fieldName} of form ${formName} expected renderer for ${fieldTypeDef.name} but instead found a renderer for ${form.typeDef.name}`);
            }
          }
        }
      }

      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef: FormDef = forms.get(formName)!
        const formTypeDef = types.get(formDef.type)
        const configFormDef = formsConfig["forms"][formName];
        if (formsConfig["forms"][formName].header){
          formDef.header = formsConfig["forms"][formName].header
        }
        Object.keys(configFormDef["fields"]).forEach(fieldName => {
          const fieldConfig = configFormDef["fields"][fieldName]
          const fieldTypeDef = formTypeDef?.fields.get(fieldName);
          if (fieldTypeDef)
            rendererMatchesType(formName, fieldName)(fieldTypeDef, fieldConfig)
          if (fieldTypeDef && fieldTypeDef.kind == "application" && fieldTypeDef.value == "List" && (builtIns.renderers.list.has(fieldConfig["renderer"]))) {
            // TODO: remove object check when deprecating string type element renderer
            let elementRenderer = typeof fieldConfig["elementRenderer"] == "string" ? fieldConfig["elementRenderer"] : fieldConfig["elementRenderer"]?.renderer
            let elementType = fieldTypeDef.args[0]
            const rendererHasType = (elementRenderer: string, elementType: string): Array<string> => {
              const primitiveRendererNames = builtIns.primitives.get(elementType)
              const injectedPrimitiveRendererNames = injectedPrimitives?.injectedPrimitives.get(elementType as keyof T)
              if (primitiveRendererNames != undefined || injectedPrimitiveRendererNames != undefined) {
                const primitiveRenderers =
                  Set(primitiveRendererNames ? primitiveRendererNames.renderers.flatMap(_ => builtIns.renderers[_]).toArray() : []).concat(
                    injectedPrimitives ? Set(injectedPrimitiveRendererNames?.renderers.flatMap(_ => injectedPrimitives.renderers[_])).toArray() : []
                  )
                if (!primitiveRenderers.has(elementRenderer)) {
                  return [`${elementType} cannot be rendered by primitive renderer ${elementRenderer}`]
                }
                // do we have elementRenderer as a builtIn renderer with the right type?
              } else {
                let elementForm = forms.get(elementRenderer)
                if (elementForm != undefined) {
                  if (elementForm.type != elementType)
                    return [`${elementType} cannot be rendered by form renderer ${elementRenderer} (which renders ${elementForm.type})`]
                } else {
                  return [`cannot find ${elementType}, cannot validate whether or not ${elementRenderer} is the right one`]
                }
              }
              return []
            }
            let elementErrors = rendererHasType(elementRenderer, elementType)
            if (elementErrors.length > 0)
              errors = errors.push(...elementErrors)
          }
          if (fieldTypeDef?.kind == "lookup") {
            if (!forms.has(fieldConfig.renderer))
              errors = errors.push(`field ${(fieldName)} of form ${formName} references non-existing form ${fieldConfig["renderer"]}`);
            else {
              const otherForm = forms.get(fieldConfig.renderer)!
              if (otherForm.type != fieldTypeDef.name)
                errors = errors.push(`field ${(fieldName)} of form ${formName} references form ${fieldConfig["renderer"]}, which has type ${otherForm.type} whereas ${fieldTypeDef.name} was expected`);
            }
          }
          // TODO: remove these warnings and object check when we remove the deprecated elementLabel and elementTooltip fields
          if(fieldConfig.elementLabel){
            console.error("Warning: using elementlabel for a list field is deprecated, use a renderer object with label and tooltip properties instead")
          }
          if(fieldConfig.elementTooltip){
            console.error("Warning: using elementTooltip for a list field is deprecated, use a renderer object with label and tooltip properties instead")
          }
          if(typeof fieldConfig.elementRenderer == "string"){
            console.error("Warning: using a string elementRenderer for a list field is deprecated, use a renderer object instead")
          }
          formDef.fields = formDef.fields.set(
            fieldName, {
            renderer: fieldConfig.renderer,
            label: fieldConfig.label,
            tooltip: fieldConfig.tooltip,
            elementRenderer: typeof fieldConfig.elementRenderer == "string" ?
             {
              renderer: fieldConfig.elementRenderer,
              label: fieldConfig.elementLabel,
              tooltip: fieldConfig.elementTooltip,
             } :
              fieldConfig.elementRenderer,
            mapRenderer: 
              fieldConfig.keyRenderer && fieldConfig.valueRenderer ? 
                { keyRenderer:fieldConfig.keyRenderer, valueRenderer:fieldConfig.valueRenderer } 
              : undefined,
            visible: BoolExpr.Default(fieldConfig.visible),
            disabled: fieldConfig.disabled != undefined ?
              BoolExpr.Default(fieldConfig.disabled)
              : BoolExpr.Default.false(),
            api: { stream: fieldConfig.stream, enumOptions: fieldConfig.options }
          })
        })
      })

      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef = forms.get(formName)!
        const configFormDef = formsConfig["forms"][formName];
        if ("tabs" in configFormDef == false)
          errors = errors.push(`form ${formName} is missing required attribute 'tabs'`);
        else {
          let tabs: FormLayout = OrderedMap()
          Object.keys(configFormDef.tabs).forEach(tabName => {
            const tabConfig = configFormDef.tabs[tabName]
            if ("columns" in tabConfig == false)
              errors = errors.push(`tab ${tabName} in form ${formName} is missing required attribute 'columns'`);
            else {
              let cols: TabLayout = { columns: OrderedMap() }
              tabs = tabs.set(tabName, cols)
              Object.keys(tabConfig.columns).forEach(colName => {
                const colConfig = tabConfig.columns[colName]
                if ("groups" in colConfig == false)
                  errors = errors.push(`column ${colName} in tab ${tabName} in form ${formName} is missing required attribute 'groups'`);
                else {
                  let column: ColumnLayout = { groups: OrderedMap() }
                  cols.columns = cols.columns.set(colName, column)
                  Object.keys(colConfig.groups).forEach(groupName => {
                    const groupConfig = colConfig.groups[groupName]
                    let group: GroupLayout = []
                    column.groups = column.groups.set(groupName, group)
                    if (!Array.isArray(groupConfig))
                      errors = errors.push(`group ${groupName} in column ${colName} in tab ${tabName} in form ${formName} should be an array of field names`);
                    else
                      groupConfig.forEach((fieldName: any) => {
                        if (!formDef.fields.has(fieldName))
                          errors = errors.push(`group ${groupName} in column ${colName} in tab ${tabName} in form ${formName} references non-existing field '${fieldName}'`);
                        else {
                          group.push(fieldName)
                        }
                      })
                  })
                }
              })
            }
          })
          formDef.tabs = tabs
        }
      });

      let launchers: FormsConfig["launchers"] = {
        create: Map<string, Launcher>(),
        edit: Map<string, Launcher>(),
      }
      Object.keys(formsConfig["launchers"]).forEach((launcherName: any) => {
        const launcherKinds = ["create", "edit"]
        if (launcherKinds.includes(formsConfig["launchers"][launcherName]["kind"]) == false) {
          errors = errors.push(`launcher '${launcherName}' has invalid 'kind': expected any of ${JSON.stringify(launcherKinds)}`);
          return
        }
        const launcherKind = formsConfig["launchers"][launcherName]["kind"] as Launcher["kind"]
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
        if (form.type != api.type)
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
        types: types,
        forms: forms,
        apis: {
          enums: enums,
          streams: streams,
          entities: entities,
        },
        launchers: launchers
      });
    }
  }
}