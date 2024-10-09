import { Set, Map, OrderedMap } from "immutable";
import { BoolExpr, Sum } from "../../../../../../main";


export type FieldName = string;
export type TypeName = string;
export type TypeDefinition = {
  extends: Array<TypeName>;
  name: TypeName;
  fields: OrderedMap<FieldName, Type>;
};
export type Type = {
  kind: "lookup"; name: TypeName;
} | {
  kind: "primitive"; value: "string" | "number" | "boolean" | "Date" | "CollectionReference";
} | {
  kind: "application"; value: TypeName; args: Array<TypeName>;
};
export type FieldConfig = {
  renderer: string;
  api: { stream?: string, enumOptions?: string },
  visible: BoolExpr<any>;
};
export type FormDef = {
  name: string;
  type: TypeName;
  fields: Map<FieldName, FieldConfig>;
  tabs: FormLayout;
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
  name:string,
  kind:"create"|"edit",
  form:string,
  api:string
}
export type EntityApi = {
  type:TypeName,
  methods:{ create:boolean, get:boolean, update:boolean, default:boolean }
}
export type FormsConfig = {
  types: Map<TypeName, TypeDefinition>;
  apis: {
    enums: Map<string, TypeName>;
    streams: Map<string, TypeName>;
    entities: Map<string, EntityApi>;
  };
  forms: Map<string, FormDef>;
  launchers: {
    create:Map<string, Launcher>;
    edit:Map<string, Launcher>;
  }
};
export type FormValidationError = string;

export type BuiltIns = {
  primitives: Set<string>;
  generics: Set<string>;
  renderers: {
    BooleanViews: Set<string>;
    NumberViews: Set<string>;
    StringViews: Set<string>;
    DateViews: Set<string>;
    EnumViews: Set<string>;
    EnumMultiselectViews: Set<string>;
    InfiniteStreamViews: Set<string>;
    InfiniteStreamMultiselectViews: Set<string>;
  };
};

export type FormValidationResult = Sum<FormsConfig, Array<FormValidationError>>
export const FormsConfig = {
  Default: {
    validateAndParseAPIResponse: (builtIns: BuiltIns) => (formsConfig: any): FormValidationResult => {
      let errors: Array<FormValidationError> = [];
      let types: Map<TypeName, TypeDefinition> = Map();
      if ("types" in formsConfig == false) {
        errors.push("the formsConfig does not contain a 'types' field");
        return Sum.Default.right(errors);
      }
      Object.keys(formsConfig["types"]).forEach((typeName: any) => {
        let typeDef: TypeDefinition = { name: typeName, extends: [], fields: OrderedMap() };
        types = types.set(typeName, typeDef);
        const configTypeDef = formsConfig["types"][typeName];
        if ("extends" in configTypeDef) {
          if (Array.isArray(configTypeDef["extends"]) && configTypeDef["extends"].every(_ => typeof (_) == "string"))
            typeDef.extends.push(...configTypeDef["extends"]);

          else
            errors.push(`invalid 'extends' clause in type ${typeName}: expected string[]`);
        }
        if ("fields" in configTypeDef == false)
          errors.push(`missing 'fields' in type ${typeName}: expected object`);

        Object.keys(configTypeDef["fields"]).forEach((fieldName: any) => {
          let configFieldType = configTypeDef["fields"][fieldName];
          if (typeof configFieldType == "string") {
            if (builtIns.primitives.has(configFieldType))
              typeDef.fields = typeDef.fields.set(fieldName, { kind: "primitive", value: configFieldType as any });

            else
              typeDef.fields = typeDef.fields.set(fieldName, { kind: "lookup", name: configFieldType as any });
          } else if (typeof configFieldType == "object") {
            if ("fun" in configFieldType && "args" in configFieldType &&
              typeof configFieldType["fun"] == "string" &&
              Array.isArray(configFieldType["args"]) &&
              configFieldType["args"].every(_ => typeof (_) == "string")) {
                const fieldType:Type = {
                  kind: "application",
                  value: configFieldType["fun"] as any,
                  args: configFieldType["args"] as any,
                }
              typeDef.fields = typeDef.fields.set(fieldName, fieldType);
            }
            else
              errors.push(`field ${fieldName} in type ${typeName}: expected application, found ${JSON.stringify(configFieldType)}`);
          }
        });
      });
      types.forEach((typeDef, typeName) => {
        typeDef.extends.forEach(extendedTypeName => {
          if (!builtIns.primitives.includes(extendedTypeName) && !types.has(extendedTypeName))
            errors.push(`type ${typeName} extends non-existent type ${extendedTypeName}`);
        });
        typeDef.fields.forEach((fieldDef, fieldName) => {
          if (fieldDef.kind == "primitive" && !builtIns.primitives.includes(fieldDef.value))
            errors.push(`field ${fieldName} of type ${typeName} is non-existent primitive type ${fieldDef.value}`);
          if (fieldDef.kind == "lookup" && !types.has(fieldDef.name))
            errors.push(`field ${fieldName} of type ${typeName} is non-existent defined type ${fieldDef.name}`);
          if (fieldDef.kind == "application" && !builtIns.generics.includes(fieldDef.value))
            errors.push(`field ${fieldName} of type ${typeName} applies non-existent generic  type ${fieldDef.value}`);
          if (fieldDef.kind == "application" && fieldDef.args.some(argType => !builtIns.primitives.includes(argType) && !types.has(argType)))
            errors.push(`field ${fieldName} of type ${typeName} applies non-existent type arguments ${JSON.stringify(fieldDef.args.filter(argType => !builtIns.primitives.has(argType) && !types.has(argType)))}`);
          if (fieldDef.kind == "application" && fieldDef.value == "SingleSelection") {
            if (fieldDef.args.length != 1)
              errors.push(`field ${fieldName} in type ${typeName}: SingleSelection should have exactly one type argument, found ${JSON.stringify(fieldDef.args)}`);
            else {
              const argType = types.get(fieldDef.args[0])!
              if (argType.extends.length != 1 || argType.extends[0] != "CollectionReference") 
                errors.push(`field ${fieldName} in type ${typeName}: SingleSelection requires ${argType.name} to 'extend CollectionReference'`);
            }
          }
          if (fieldDef.kind == "application" && fieldDef.value == "Multiselection") {
            if (fieldDef.args.length != 1)
              errors.push(`field ${fieldName} in type ${typeName}: Multiselection should have exactly one type argument, found ${JSON.stringify(fieldDef.args)}`);
            else {
              const argType = types.get(fieldDef.args[0])!
              if (argType.extends.length != 1 || argType.extends[0] != "CollectionReference") 
                errors.push(`field ${fieldName} in type ${typeName}: Multiselection requires ${argType.name} to 'extend CollectionReference'`);
            }
          }
    });
      });

      if ("forms" in formsConfig == false) {
        errors.push("the formsConfig does not contain a 'forms' field");
        return Sum.Default.right(errors);
      }
      if ("apis" in formsConfig == false) {
        errors.push("the formsConfig does not contain an 'apis' field");
        return Sum.Default.right(errors);
      }
      if ("enumOptions" in formsConfig["apis"] == false) {
        errors.push("formsConfig.apis does not contain an 'enumOptions' field");
        return Sum.Default.right(errors);
      }
      if ("entities" in formsConfig["apis"] == false) {
        errors.push("formsConfig.apis does not contain an 'entities' field");
        return Sum.Default.right(errors);
      }
      let enums: Map<string, TypeName> = Map();
      Object.keys(formsConfig["apis"]["enumOptions"]).forEach((enumOptionsName: any) => {
        if (!types.has(formsConfig["apis"]["enumOptions"][enumOptionsName])) {
          errors.push(`formsConfig.apis.enumOptions refers to non-existent type ${formsConfig['apis']['enumOptions'][enumOptionsName]}`);
        } else {
          enums = enums.set(enumOptionsName, formsConfig["apis"]["enumOptions"][enumOptionsName])
        }
      })
      let streams: Map<string, TypeName> = Map();
      Object.keys(formsConfig["apis"]["searchableStreams"]).forEach((searchableStreamName: any) => {
        if (!types.has(formsConfig["apis"]["searchableStreams"][searchableStreamName])) {
          errors.push(`formsConfig.apis.searchableStreams refers to non-existent type ${formsConfig['apis']['searchableStreams'][searchableStreamName]}`);
        } else {
          streams = streams.set(searchableStreamName, formsConfig["apis"]["searchableStreams"][searchableStreamName])
        }
      })
      let entities: Map<string, EntityApi> = Map();
      Object.keys(formsConfig["apis"]["entities"]).forEach((entityApiName: any) => {
        const entityApiConfig = formsConfig["apis"]["entities"][entityApiName]
        if (!types.has(formsConfig["apis"]["entities"][entityApiName]["type"])) {
          errors.push(`formsConfig.apis.entities refers to non-existent type ${formsConfig['apis']['entities'][entityApiName]["type"]}`);
        } else {
          entities = entities.set(entityApiName, {
            type:entityApiConfig["type"],
            methods:{
              create:entityApiConfig["methods"].includes("create"),
              get:entityApiConfig["methods"].includes("get"),
              update:entityApiConfig["methods"].includes("update"),
              default:entityApiConfig["methods"].includes("default"),
            }
          })
        }
      })

      let forms: Map<string, FormDef> = Map();
      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef: FormDef = { name: formName, type: "", fields: Map(), tabs: Map() };
        forms = forms.set(formName, formDef);
        const configFormDef = formsConfig["forms"][formName];
        if ("type" in configFormDef == false) {
          errors.push(`form ${formName} is missing the required 'type' attribute`);
        } else {
          if (types.has(configFormDef["type"]))
            formDef.type = configFormDef["type"];
          else
            errors.push(`form ${formName} references non-existing type ${configFormDef["type"]}`);
        }
        const formTypeDef = types.get(configFormDef["type"])
        if ("fields" in configFormDef == false) {
          errors.push(`form ${formName} is missing the required 'fields' attribute`);
        } else {
          formTypeDef?.fields.forEach((fieldType, fieldName) => {
            if (!Object.keys(configFormDef["fields"]).includes(fieldName))
              errors.push(`form ${formName} is missing a renderer for field ${fieldName} which is defined on type ${formDef.type}`);
          })
          Object.keys(configFormDef["fields"]).forEach(fieldName => {
            const fieldConfig = configFormDef["fields"][fieldName]
            if (!formTypeDef?.fields.has(fieldName)) {
              errors.push(`form ${formName} references field ${fieldName} which does not exist on type ${formDef.type}`);
            } else {
              if ("renderer" in fieldConfig == false) {
                errors.push(`field ${fieldName} of form ${formName} has no 'renderer' attribute`);
              }
              const fieldTypeDef = formTypeDef?.fields.get(fieldName)
              if (fieldTypeDef?.kind == "primitive") {
                if (fieldTypeDef.value == "boolean") {
                  if (!builtIns.renderers.BooleanViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                } else if (fieldTypeDef.value == "number") {
                  if (!builtIns.renderers.NumberViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                } else if (fieldTypeDef.value == "string") {
                  if (!builtIns.renderers.StringViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                } else if (fieldTypeDef.value == "Date") {
                  if (!builtIns.renderers.DateViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                } else {
                  errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                }
              } else if (fieldTypeDef?.kind == "application") {
                if (fieldTypeDef?.value == "SingleSelection") {
                  if (!builtIns.renderers.EnumViews.has(fieldConfig["renderer"]) &&
                    !builtIns.renderers.InfiniteStreamViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                } else if (fieldTypeDef?.value == "Multiselection") {
                  if (!builtIns.renderers.EnumMultiselectViews.has(fieldConfig["renderer"]) &&
                    !builtIns.renderers.InfiniteStreamMultiselectViews.has(fieldConfig["renderer"]))
                    errors.push(`field ${fieldName} of form ${formName} references non-existing ${fieldTypeDef.value} 'renderer' ${fieldConfig["renderer"]}`);
                }
                if (fieldTypeDef.args.length < 1)
                  errors.push(`field ${fieldName} of form ${formName} should have one type argument}`);
                else if (
                  (builtIns.renderers.EnumMultiselectViews.has(fieldConfig["renderer"]) ||
                    builtIns.renderers.EnumViews.has(fieldConfig["renderer"])) && "options" in fieldConfig != true)
                  errors.push(`field ${fieldName} of form ${formName} is missing the 'options' property`);
                else if (
                  (builtIns.renderers.InfiniteStreamViews.has(fieldConfig["renderer"]) ||
                    builtIns.renderers.InfiniteStreamMultiselectViews.has(fieldConfig["renderer"])) && "stream" in fieldConfig != true)
                  errors.push(`field ${fieldName} of form ${formName} is missing the 'stream' property`);
                else if ((builtIns.renderers.EnumMultiselectViews.has(fieldConfig["renderer"]) ||
                  builtIns.renderers.EnumViews.has(fieldConfig["renderer"])) && (enums.get(fieldConfig["options"])) != fieldTypeDef.args[0]) {
                  if (enums.has(fieldConfig["options"]))
                    errors.push(`field ${fieldName} of form ${formName} references an enum api with type ${enums.get(fieldConfig["options"])} when ${fieldTypeDef.args[0]} was expected`);
                  else
                    errors.push(`field ${fieldName} of form ${formName} references a non-existing enum api`);
                } else if ((builtIns.renderers.InfiniteStreamMultiselectViews.has(fieldConfig["renderer"]) ||
                  builtIns.renderers.InfiniteStreamViews.has(fieldConfig["renderer"])) && (streams.get(fieldConfig["stream"])) != fieldTypeDef.args[0]) {
                  if (streams.has(fieldConfig["stream"]))
                    errors.push(`field ${fieldName} of form ${formName} references an api with type ${streams.get(fieldConfig["stream"])} when ${fieldTypeDef.args[0]} was expected`);
                  else
                    errors.push(`field ${fieldName} of form ${formName} references a non-existing stream api`);
                }
              }
            }
          })
        }
      })

      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef: FormDef = forms.get(formName)!
        const formTypeDef = types.get(formDef.type)
        const configFormDef = formsConfig["forms"][formName];
        Object.keys(configFormDef["fields"]).forEach(fieldName => {
          const fieldConfig = configFormDef["fields"][fieldName]
          const fieldTypeDef = formTypeDef?.fields.get(fieldName);
          if (fieldTypeDef?.kind == "lookup") {
            if (!forms.has(fieldConfig.renderer))
              errors.push(`field ${fieldName} of form ${formName} references non-existing form ${fieldConfig["renderer"]}`);
            else {
              const otherForm = forms.get(fieldConfig.renderer)!
              if (otherForm.type != fieldTypeDef.name)
                errors.push(`field ${fieldName} of form ${formName} references form ${fieldConfig["renderer"]}, which has type ${otherForm.type} whereas ${fieldTypeDef.name} was expected`);
            }
          }
          formDef.fields = formDef.fields.set(
            fieldName, {
            renderer: fieldConfig.renderer,
            visible: BoolExpr.Default(fieldConfig.visible),
            api: { stream: fieldConfig.stream, enumOptions: fieldConfig.options }
          })
        })
      })

      Object.keys(formsConfig["forms"]).forEach((formName: any) => {
        let formDef = forms.get(formName)!
        const formTypeDef = types.get(formDef.type)
        const configFormDef = formsConfig["forms"][formName];
        if ("tabs" in configFormDef == false)
          errors.push(`form ${formName} is missing required attribute 'tabs'`);
        else {
          let tabs: FormLayout = OrderedMap()
          Object.keys(configFormDef.tabs).forEach(tabName => {
            const tabConfig = configFormDef.tabs[tabName]
            if ("columns" in tabConfig == false)
              errors.push(`tab ${tabName} in form ${formName} is missing required attribute 'columns'`);
            else {
              let cols: TabLayout = { columns: OrderedMap() }
              tabs = tabs.set(tabName, cols)
              Object.keys(tabConfig.columns).forEach(colName => {
                const colConfig = tabConfig.columns[colName]
                if ("groups" in colConfig == false)
                  errors.push(`column ${colName} in tab ${tabName} in form ${formName} is missing required attribute 'groups'`);
                else {
                  let column: ColumnLayout = { groups: OrderedMap() }
                  cols.columns = cols.columns.set(colName, column)
                  Object.keys(colConfig.groups).forEach(groupName => {
                    const groupConfig = colConfig.groups[groupName]
                    let group: GroupLayout = []
                    column.groups = column.groups.set(groupName, group)
                    if (!Array.isArray(groupConfig))
                      errors.push(`group ${groupName} in column ${colName} in tab ${tabName} in form ${formName} should be an array of field names`);
                    else
                      groupConfig.forEach((fieldName: any) => {
                        if (!formDef.fields.has(fieldName))
                          errors.push(`group ${groupName} in column ${colName} in tab ${tabName} in form ${formName} references non-existing field '${fieldName}'`);
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

      if ("launchers" in formsConfig == false) {
        errors.push("the formsConfig does not contain a 'launchers' field");
        return Sum.Default.right(errors);
      }
      let launchers = { 
        create:Map<string, Launcher>(),
        edit:Map<string, Launcher>()
      }
      Object.keys(formsConfig["launchers"]).forEach((launcherName: any) => {
        let launcherConfig = formsConfig["launchers"][launcherName]
        const launcherKinds = ["create", "edit"]
        if (launcherKinds.includes(formsConfig["launchers"][launcherName]["kind"]) == false)
          errors.push(`launcher '${launcherName}' has invalid 'kind': expected any of ${JSON.stringify(launcherKinds)}`);
        if (forms.has(formsConfig["launchers"][launcherName]["form"]) == false)
          errors.push(`launcher '${launcherName}' references non-existing form '${formsConfig.launchers[launcherName].form}'`);
        if (entities.has(formsConfig["launchers"][launcherName]["api"]) == false)
          errors.push(`launcher '${launcherName}' references non-existing entity api '${formsConfig.launchers[launcherName].api}'`);
        const form = forms.get(formsConfig["launchers"][launcherName]["form"])!
        const api = entities.get(formsConfig["launchers"][launcherName]["api"])!
        if (form.type != api.type)
          errors.push(`form and api in launcher '${launcherName}' reference different types '${form.type}' and '${api.type}'`);
        if (formsConfig["launchers"][launcherName]["kind"] == "create" && 
          !(api.methods.create && api.methods.default)
        )
          errors.push(`launcher '${launcherName}' requires api methods 'create' and 'default'`);
          if (formsConfig["launchers"][launcherName]["kind"] == "edit" && 
            !(api.methods.get && api.methods.update)
          )
            errors.push(`launcher '${launcherName}' requires api methods 'get' and 'update'`);
          let launcher: Launcher = { 
          name: launcherName, 
          kind:formsConfig["launchers"][launcherName]["kind"],
          form:formsConfig["launchers"][launcherName]["form"],
          api:formsConfig["launchers"][launcherName]["api"],
         };
         if (launcher.kind == "create")
          launchers.create = launchers.create.set(launcherName, launcher)
        else
          launchers.edit = launchers.edit.set(launcherName, launcher)
      })

      if (errors.length > 0)
        return Sum.Default.right(errors);

      return Sum.Default.left({
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