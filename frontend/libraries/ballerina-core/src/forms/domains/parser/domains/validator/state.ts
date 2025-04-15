import { Set, Map, OrderedMap, List } from "immutable";
import {
  ApiConverters,
  BuiltIns,
  FieldName,
  FormsConfigMerger,
  InjectedPrimitives,
  isObject,
  ParsedType,
  RawFieldType,
  RawType,
  TypeName,
  PredicateFormLayout,
  FormLayout,
  PredicateValue,
  Unit,
  Updater,
  Delta,
  ValueOption,
} from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";
import { ParsedRenderer } from "../renderer/state";
import { fail } from "assert";

export type RawForm = {
  type?: any;
  fields?: any;
  tabs?: any;
  header?: any;
};
export const RawForm = {
  hasType: (_: any): _ is { type: any } => isObject(_) && "type" in _,
  hasFields: (_: any): _ is { fields: any } => isObject(_) && "fields" in _,
  hasTabs: (_: any): _ is { tabs: any } => isObject(_) && "tabs" in _,
  hasHeader: (_: any): _ is { header: any } => isObject(_) && "header" in _,
};
export type ParsedFormConfig<T> = {
  name: string;
  type: ParsedType<T>;
  fields: Map<FieldName, ParsedRenderer<T>>;
  tabs: PredicateFormLayout;
  header?: string;
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

        // This error check must stay in the frontend, as it depends on injected types
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
        let keyOfTypes: Map<TypeName, RawType<T>> = Map();

        let parsedTypes: Map<TypeName, ParsedType<T>> = Map();
        const rawTypesFromConfig = formsConfig.types;
        const rawTypeNames = Set(Object.keys(rawTypesFromConfig));
        Object.entries(rawTypesFromConfig).forEach(([rawTypeName, rawType]) => {
          if (RawType.isKeyOf<T>(rawType)) {
            keyOfTypes = keyOfTypes.set(rawTypeName, rawType);
            return;
          }
          if (RawType.isExtendedType<T>(rawType)) {
            parsedTypes = parsedTypes.set(
              rawTypeName,
              ParsedType.Default.lookup(rawType.extends[0]),
            );
            return;
          }

          if (RawFieldType.isUnion(rawType)) {
            const parsingResult = ParsedType.Operations.ParseRawFieldType(
              rawTypeName,
              rawType,
              rawTypeNames,
              injectedPrimitives,
            );
            if (parsingResult.kind == "errors") {
              errors = errors.concat(parsingResult.errors.toArray());
              return;
            }
            parsedTypes = parsedTypes.set(rawTypeName, parsingResult.value);
            return;
          }

          if (!RawType.hasFields(rawType)) {
            errors = errors.push(
              `missing 'fields' in type ${rawTypeName}: expected object`,
            );
            return;
          }

          const parsedType: ParsedType<T> = {
            kind: "record",
            value: rawTypeName,
            fields: Map(),
          };
          Object.entries(rawType.fields).forEach(
            ([rawFieldName, rawFieldType]: [
              rawFieldName: any,
              rawFieldType: any,
            ]) => {
              if (
                RawFieldType.isMaybeLookup(rawFieldType) &&
                !RawFieldType.isPrimitive(rawFieldType, injectedPrimitives) &&
                (injectedPrimitives?.injectedPrimitives.has(
                  rawFieldType as keyof T,
                ) ||
                  builtIns.primitives.has(rawFieldType))
              ) {
                // This validation must be done at runtime, as we need to know the injectedPrimitives and field names
                errors = errors.push(
                  `field ${rawFieldName} in type ${rawTypeName}: fields, injectedPrimitive and builtIns cannot have the same name`,
                );
                return;
              }

              const parsedFieldType = ParsedType.Operations.ParseRawFieldType(
                rawFieldName,
                rawFieldType,
                rawTypeNames,
                injectedPrimitives,
              );
              if (parsedFieldType.kind == "errors") {
                errors = errors.concat(parsedFieldType.errors.toArray());
                return;
              }

              parsedType.fields = parsedType.fields.set(
                rawFieldName,
                parsedFieldType.value,
              );
            },
          );
          parsedTypes = parsedTypes.set(rawTypeName, parsedType);
        });

        const keyOfTypesResult = ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, ParsedType<T>], string>>(
            keyOfTypes.entrySeq().map(([rawTypeName, rawType]) => {
              return ParsedType.Operations.ParseRawKeyOf(
                rawTypeName,
                rawType,
                parsedTypes,
              ).Then((parsedType) =>
                ValueOrErrors.Default.return([rawTypeName, parsedType]),
              );
            }),
          ),
        );
        if (keyOfTypesResult.kind == "errors") {
          errors = errors.concat(keyOfTypesResult.errors.toArray());
          return ValueOrErrors.Default.throw(errors);
        }
        keyOfTypesResult.value.forEach(([rawTypeName, parsedType]) => {
          parsedTypes = parsedTypes.set(rawTypeName, parsedType);
        });

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
            if (
              !RawForm.hasType(form) ||
              !RawForm.hasFields(form) ||
              !RawForm.hasTabs(form)
            ) {
              errors = errors.push(
                `form ${formName} is missing the required type, fields or tabs attribute`,
              );
              return;
            }
            const formType = parsedTypes.get(form.type)!;
            if (formType.kind != "record") {
              errors = errors.push(
                `form ${formName} references non-record type ${form.type}`,
              );
              return;
            }

            const parsedForm: ParsedFormConfig<T> = {
              name: formName,
              fields: Map(),
              tabs: Map(),
              type: parsedTypes.get(form.type)!,
              header: RawForm.hasHeader(form) ? form.header : undefined,
            };

            Object.entries(form.fields).forEach(
              ([fieldName, field]: [fieldName: string, field: any]) => {
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

            const parsedTabs = FormLayout.Operations.ParseLayout(
              form,
              formName,
            );
            if (parsedTabs.kind == "errors") {
              errors = errors.concat(parsedTabs.errors.toArray());
              return ValueOrErrors.Default.throw(errors);
            }
            parsedForm.tabs = parsedTabs.value;

            forms = forms.set(formName, parsedForm);
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

        console.debug({ parsedTypes, fc });

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

type FailingCheckApproval = (newApprovalValue: boolean) => {
  // function to call when clicking on the approval button
  OptimisticUpdate: Updater<PredicateValue>; // applied immediately in the FE
  BackendDeltaPATCH: Delta; // sent to the BE
};

type FailingCheckOp = {
  FailingCheck: PredicateValue;
  ToggleApproval: FailingCheckApproval;
};

type CollectFailingChecks<T = Unit> = (
  typesMap: Map<TypeName, ParsedType<T>>,
  t: ParsedType<T>,
) => (v: PredicateValue) => ValueOrErrors<
  // these are all fields somewhere in the root
  Array<FailingCheckOp>,
  [_: any, msg: string]
>;

const traverse: CollectFailingChecks = (typesMap, t) => {
  switch (t.kind) {
    case "unionCase":
      return (_) => ValueOrErrors.Default.return([]);
    case "lookup":
      const lookupType = typesMap.get(t.name)!;
      if (!lookupType) {
        return (_) =>
          ValueOrErrors.Default.throwOne([
            t.name,
            "cannot find lookup type name",
          ]);
      }

      const traverseLookupValue = traverse(typesMap, lookupType);
      return (v) =>
        !PredicateValue.Operations.IsVarLookup(v)
          ? ValueOrErrors.Default.throwOne([v, "not a ValueLookup"])
          : traverseLookupValue(v);

    case "primitive":
      return (_) => ValueOrErrors.Default.return([]);

    case "option":
      const traverseOptionValue = traverse(typesMap, t.value);
      return (v: PredicateValue) =>
        !PredicateValue.Operations.IsOption(v)
          ? ValueOrErrors.Default.throwOne([v, "not a ValueOption"])
          : !v.isSome
          ? ValueOrErrors.Default.return([])
          : traverseOptionValue(v.value).Map((valueFailingChecks) =>
              valueFailingChecks.map<FailingCheckOp>((fOp) => ({
                FailingCheck: fOp.FailingCheck,
                ToggleApproval: (a) => {
                  const innerApproval = fOp.ToggleApproval(a);
                  return {
                    OptimisticUpdate: ValueOption.Updaters.value(
                      innerApproval.OptimisticUpdate,
                    ),
                    BackendDeltaPATCH: {
                      kind: "OptionValue",
                      value: innerApproval.BackendDeltaPATCH,
                    },
                  };
                },
              })),
            );
    case "record":
      return (_) => ValueOrErrors.Default.return([]);
    case "application":
      return (_) => ValueOrErrors.Default.return([]);
    case "union":
      return (_) => ValueOrErrors.Default.return([]);
    default:
      return (_) => ValueOrErrors.Default.return([]);
  }
};
