import { Set, Map, OrderedMap, List } from "immutable";
import {
  ApiConverters,
  BuiltIns,
  CaseName,
  FieldName,
  FormsConfigMerger,
  InjectedPrimitives,
  isObject,
  ParsedType,
  TypeName,
} from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";
import { ParsedRenderer, ParsedUnionRenderer } from "../renderer/state";

export type RawForm = {
  type?: any;
  renderer?: any;
  fields?: any;
  cases?: any;
  tabs?: any;
  header?: any;
  extends?: any;
};
export const RawForm = {
  hasType: (_: any): _ is { type: any } => isObject(_) && "type" in _,
  hasRenderer: (_: any): _ is { renderer: any } =>
    isObject(_) && "renderer" in _,
  hasCases: (_: any): _ is { cases: any } => isObject(_) && "cases" in _,
  hasFields: (_: any): _ is { fields: any } => isObject(_) && "fields" in _,
  hasTabs: (_: any): _ is { tabs: any } => isObject(_) && "tabs" in _,
  hasHeader: (_: any): _ is { header: any } => isObject(_) && "header" in _,
  hasExtends: (_: any): _ is { extends: any } =>
    isObject(_) && "extends" in _ && Array.isArray(_.extends),
};

export type ParsedRecordFormConfig<T> = {
  kind: "recordForm";
  name: string;
  type: ParsedType<T>;
  fields: Map<FieldName, ParsedRenderer<T>>;
  tabs: FormLayout;
  header?: string;
};

export type ParsedUnionFormConfig<T> = {
  kind: "unionForm";
  name: string;
  type: ParsedType<T>;
  renderer: ParsedUnionRenderer<T>;
  header?: string;
};

export type ParsedFormConfig<T> =
  | ParsedRecordFormConfig<T>
  | ParsedUnionFormConfig<T>;

export type FormLayout = OrderedMap<string, TabLayout>;
export type GroupLayout = Array<FieldName>;
export type ColumnLayout = {
  groups: OrderedMap<string, GroupLayout>;
};
export type TabLayout = {
  columns: OrderedMap<string, ColumnLayout>;
};

export type BaseLauncher = {
  name: string;
  form: string;
};

export type CreateLauncher = {
  kind: "create";
  api: string;
  configApi: string;
} & BaseLauncher;

export type EditLauncher = {
  kind: "edit";
  api: string;
  configApi: string;
} & BaseLauncher;

export type PassthroughLauncher = {
  kind: "passthrough";
  configType: string;
} & BaseLauncher;

export type Launcher = CreateLauncher | EditLauncher | PassthroughLauncher;

export type RawEntityApi = {
  type?: any;
  methods?: any;
};
export type EntityApi = {
  type: TypeName;
  methods: { create: boolean; get: boolean; update: boolean; default: boolean };
};
export type GlobalConfigurationApi = {
  type: TypeName;
  methods: { get: boolean };
};

export type RawFormJSON = {
  types?: any;
  apis?: any;
  forms?: any;
  launchers?: any;
};
export const RawFormJSON = {
  hasTypes: (_: any): _ is { types: object } =>
    isObject(_) && "types" in _ && isObject(_.types),
  hasForms: (_: any): _ is { forms: object } =>
    isObject(_) && "forms" in _ && isObject(_.forms),
  hasApis: (
    _: any,
  ): _ is {
    apis: {
      enumOptions: object;
      searchableStreams: object;
      entities: { globalConfiguration: object };
      globalConfiguration: object;
    };
  } =>
    isObject(_) &&
    "apis" in _ &&
    isObject(_.apis) &&
    "enumOptions" in _.apis &&
    isObject(_.apis.enumOptions) &&
    "searchableStreams" in _.apis,
  hasLaunchers: (_: any): _ is { launchers: any } =>
    isObject(_) && "launchers" in _,
};
export type ParsedFormJSON<T> = {
  types: Map<TypeName, ParsedType<T>>;
  apis: {
    enums: Map<string, TypeName>;
    streams: Map<string, TypeName>;
    entities: Map<string, EntityApi>;
  };
  forms: Map<string, ParsedFormConfig<T>>;
  launchers: {
    create: Map<string, CreateLauncher>;
    edit: Map<string, EditLauncher>;
    passthrough: Map<string, PassthroughLauncher>;
  };
};

export type FormValidationError = string;

export type FormConfigValidationAndParseResult<T> = ValueOrErrors<
  ParsedFormJSON<T>,
  FormValidationError
>;

export const FormsConfig = {
  Default: {
    validateAndParseFormConfig:
      <T extends { [key in keyof T]: { type: any; state: any } }>(
        builtIns: BuiltIns,
        apiConverters: ApiConverters<T>,
        injectedPrimitives?: InjectedPrimitives<T>,
      ) =>
      (fc: any): FormConfigValidationAndParseResult<T> => {
        let errors: List<FormValidationError> = List();
        const formsConfig = Array.isArray(fc)
          ? FormsConfigMerger.Default.merge(fc)
          : fc;

        if (
          !RawFormJSON.hasTypes(formsConfig) ||
          !RawFormJSON.hasForms(formsConfig) ||
          !RawFormJSON.hasApis(formsConfig) ||
          !RawFormJSON.hasLaunchers(formsConfig)
        ) {
          return ValueOrErrors.Default.throw(
            List(["the formsConfig is missing required top level fields"]),
          );
        }

        // This error check must stay in the frontend, as it depends on injected api converters that the form config is unaware of
        if (
          injectedPrimitives?.injectedPrimitives
            .keySeq()
            .toArray()
            .some(
              (injectedPrimitiveName) =>
                !Object.keys(apiConverters).includes(
                  injectedPrimitiveName as string,
                ),
            )
        )
          return ValueOrErrors.Default.throw(
            List([
              `the formsConfig does not contain an Api Converter for all injected primitives`,
            ]),
          );

        let parsedTypes: Map<TypeName, ParsedType<T>> = Map();
        const rawTypesFromConfig = formsConfig.types;
        const rawTypeNames = Set(Object.keys(rawTypesFromConfig));

        const parsedTypesVoE: ValueOrErrors<
          Map<TypeName, ParsedType<T>>,
          FormValidationError
        > = ValueOrErrors.Operations.All(
          List<ValueOrErrors<ParsedType<T>, FormValidationError>>(
            Object.entries(rawTypesFromConfig).map(([rawTypeName, rawType]) =>
              ParsedType.Operations.ParseRawType(
                rawTypeName,
                rawType,
                rawTypeNames,
                injectedPrimitives,
              ),
            ),
          ),
        ).Then((parsedTypes) => {
          const parsedTypesMap = parsedTypes.reduce((acc, parsedType) => {
            return acc.set(parsedType.typeName, parsedType);
          }, Map<TypeName, ParsedType<T>>());
          return ValueOrErrors.Default.return(parsedTypesMap);
        });

        if (parsedTypesVoE.kind == "errors") {
          errors = errors.concat(parsedTypesVoE.errors);
        }

        if (parsedTypesVoE.kind == "value") {
          const extendedTypesVoE = ParsedType.Operations.ExtendParsedTypes(
            parsedTypesVoE.value,
          );
          extendedTypesVoE.kind == "value"
            ? (parsedTypes = extendedTypesVoE.value)
            : (errors = errors.concat(extendedTypesVoE.errors));
        }

        let enums: Map<string, TypeName> = Map();
        Object.entries(formsConfig.apis.enumOptions).forEach(
          ([enumOptionName, enumOption]) =>
            (enums = enums.set(enumOptionName, enumOption)),
        );

        let streams: Map<string, TypeName> = Map();
        Object.entries(formsConfig.apis.searchableStreams).forEach(
          ([searchableStreamName, searchableStream]) =>
            (streams = streams.set(searchableStreamName, searchableStream)),
        );

        let entities: Map<string, EntityApi> = Map();
        Object.entries(formsConfig.apis.entities).forEach(
          ([entityApiName, entityApi]: [
            entiyApiName: string,
            entityApi: RawEntityApi,
          ]) => {
            entities = entities.set(entityApiName, {
              type: entityApi.type,
              methods: {
                create: entityApi.methods.includes("create"),
                get: entityApi.methods.includes("get"),
                update: entityApi.methods.includes("update"),
                default: entityApi.methods.includes("default"),
              },
            });
          },
        );

        let forms: Map<string, ParsedFormConfig<T>> = Map();
        Object.entries(formsConfig.forms).forEach(
          ([formName, form]: [formName: string, form: RawForm]) => {
            if (!RawForm.hasType(form)) {
              errors = errors.push(
                `form ${formName} is missing the required type attribute`,
              );
              return;
            }
            const formType = parsedTypes.get(form.type);
            if (formType == undefined) {
              errors = errors.push(
                `form ${formName} references non-existent type ${form.type}`,
              );
              return;
            }

            if (formType.kind == "record") {
              if (!RawForm.hasFields(form) || !RawForm.hasTabs(form)) {
                errors = errors.push(
                  `form ${formName} is missing the required fields or tabs attribute`,
                );
                return;
              }
              const parsedForm: ParsedFormConfig<T> = {
                kind: "recordForm",
                name: formName,
                fields: Map(),
                tabs: Map(),
                type: parsedTypes.get(form.type)!,
                header: RawForm.hasHeader(form) ? form.header : undefined,
              };

              Object.entries(form.fields).forEach(
                ([fieldName, field]: [fieldName: string, field: any]) => {
                  if (RawForm.hasExtends(form) && form.extends.length > 0) {
                    // defer extended forms until after all other forms have been parsed
                    return;
                  }
                  const fieldType = formType.fields.get(fieldName)!;

                  const bwcompatiblefield =
                    fieldType.kind == "application" &&
                    fieldType.value == "List" &&
                    typeof field.elementRenderer == "string"
                      ? {
                          renderer: field.renderer,
                          label: field?.label,
                          visible: field.visible,
                          disabled: field?.disabled,
                          description: field?.description,
                          elementRenderer: {
                            renderer: field.elementRenderer,
                            label: field?.elementLabel,
                            tooltip: field?.elementTooltip,
                            visible: field.visible,
                          },
                        }
                      : field;

                  return (parsedForm.fields = parsedForm.fields.set(
                    fieldName,
                    ParsedRenderer.Operations.ParseRenderer(
                      fieldType,
                      bwcompatiblefield,
                      parsedTypes,
                    ),
                  ));
                },
              );

              Object.entries(form.fields).forEach(
                ([fieldName, field]: [fieldName: string, field: any]) => {
                  if (!RawForm.hasExtends(form) || form.extends.length <= 0) {
                    // Not extended forms already parsed
                    return;
                  }
                  const fieldType = formType.fields.get(fieldName);

                  if (fieldType == undefined) {
                    const extendedForm = forms.get(form.extends[0]);
                    if (extendedForm == undefined) {
                      errors = errors.push(
                        `form ${formName} references non-existent extended form ${form.extends[0]}`,
                      );
                      return;
                    }
                    if (extendedForm.kind != "recordForm") {
                      errors = errors.push(
                        `form ${formName} extends non-record form ${form.extends[0]}`,
                      );
                      return;
                    }

                    const parsedField = extendedForm.fields.get(fieldName);
                    if (parsedField == undefined) {
                      errors = errors.push(
                        `form ${formName} references non-existent extended form field ${fieldName}`,
                      );
                      return;
                    }

                    return (parsedForm.fields = parsedForm.fields.set(
                      fieldName,
                      parsedField,
                    ));
                  }

                  const bwcompatiblefield =
                    fieldType.kind == "application" &&
                    fieldType.value == "List" &&
                    typeof field.elementRenderer == "string"
                      ? {
                          renderer: field.renderer,
                          label: field?.label,
                          visible: field.visible,
                          disabled: field?.disabled,
                          description: field?.description,
                          elementRenderer: {
                            renderer: field.elementRenderer,
                            label: field?.elementLabel,
                            tooltip: field?.elementTooltip,
                            visible: field.visible,
                          },
                        }
                      : field;

                  return (parsedForm.fields = parsedForm.fields.set(
                    fieldName,
                    ParsedRenderer.Operations.ParseRenderer(
                      fieldType,
                      bwcompatiblefield,
                      parsedTypes,
                    ),
                  ));
                },
              );

              let tabs: FormLayout = OrderedMap();
              Object.entries(form.tabs).forEach(
                ([tabName, tab]: [tabName: string, tab: any]) => {
                  let cols: TabLayout = { columns: OrderedMap() };
                  tabs = tabs.set(tabName, cols);
                  Object.entries(tab.columns).forEach(
                    ([colName, col]: [colName: string, col: any]) => {
                      let column: ColumnLayout = { groups: OrderedMap() };
                      cols.columns = cols.columns.set(colName, column);
                      Object.keys(col.groups).forEach((groupName) => {
                        const groupConfig = col.groups[groupName];
                        let group: GroupLayout = [];
                        column.groups = column.groups.set(groupName, group);
                        groupConfig.forEach((fieldName: any) => {
                          group.push(fieldName);
                        });
                      });
                    },
                  );
                },
              );
              parsedForm.tabs = tabs;
              forms = forms.set(formName, parsedForm);
            }

            if (formType.kind == "union") {
              if (!RawForm.hasCases(form) || !RawForm.hasRenderer(form)) {
                errors = errors.push(
                  `form ${formName} is missing the required cases or renderer attribute`,
                );
                return;
              }
              const parsedForm: ParsedFormConfig<T> = {
                kind: "unionForm",
                name: formName,
                renderer: ParsedRenderer.Operations.ParseRenderer(
                  formType,
                  {
                    renderer: form.renderer,
                    cases: form.cases,
                  },
                  parsedTypes,
                ),
                type: parsedTypes.get(form.type)!,
                header: RawForm.hasHeader(form) ? form.header : undefined,
              };
              forms = forms.set(formName, parsedForm);
            }
          },
        );

        let launchers: ParsedFormJSON<T>["launchers"] = {
          create: Map<string, CreateLauncher>(),
          edit: Map<string, EditLauncher>(),
          passthrough: Map<string, PassthroughLauncher>(),
        };

        Object.keys(formsConfig["launchers"]).forEach((launcherName: any) => {
          const launcher: Launcher =
            formsConfig.launchers[launcherName]["kind"] == "create" ||
            formsConfig.launchers[launcherName]["kind"] == "edit"
              ? {
                  name: launcherName,
                  kind: formsConfig.launchers[launcherName]["kind"],
                  form: formsConfig.launchers[launcherName]["form"],
                  api: formsConfig.launchers[launcherName]["api"],
                  configApi: formsConfig.launchers[launcherName]["configApi"],
                }
              : {
                  name: launcherName,
                  kind: formsConfig.launchers[launcherName]["kind"],
                  form: formsConfig.launchers[launcherName]["form"],
                  configType: formsConfig.launchers[launcherName]["configType"],
                };
          if (launcher.kind == "create")
            launchers.create = launchers.create.set(launcherName, launcher);
          else if (launcher.kind == "edit")
            launchers.edit = launchers.edit.set(launcherName, launcher);
          else if (launcher.kind == "passthrough")
            launchers.passthrough = launchers.passthrough.set(
              launcherName,
              launcher,
            );
        });

        if (errors.size > 0) {
          console.error("parsing errors");
          console.error(errors);
          return ValueOrErrors.Default.throw(errors);
        }

        return ValueOrErrors.Default.return({
          types: parsedTypes,
          forms,
          apis: {
            enums,
            streams,
            entities,
          },
          launchers,
        });
      },
  },
};
