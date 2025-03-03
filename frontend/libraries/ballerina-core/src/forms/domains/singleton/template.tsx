import { List, OrderedSet } from "immutable";
import {
  BasicUpdater,
  id,
  Unit,
  Debounced,
  Synchronized,
  unit,
  replaceWith,
  CoTypedFactory,
  Debounce,
  Synchronize,
  BasicFun,
  EntityFormState,
  EntityFormContext,
  EntityFormForeignMutationsExpected,
  EntityFormTemplate,
  EntityFormView,
  FieldTemplates,
  FieldValidationWithPath,
  FormValidatorSynchronized,
  OnChange,
  CommonFormState,
  DirtyStatus,
  FieldName,
} from "../../../../main";
import { Template } from "../../../template/state";
import { Value } from "../../../value/state";

export const Form = <
  Entity,
  FieldStates extends { formFieldStates: any },
  Context,
  ForeignMutationsExpected,
>() => ({
  Default: <
    Fields extends keyof Entity & keyof FieldStates["formFieldStates"],
  >() => {
    type State = EntityFormState<
      Entity,
      Fields,
      FieldStates,
      Context,
      ForeignMutationsExpected
    >;
    type FieldTemplate<f extends Fields> = Template<
      Context & {
        customFormState: State["formFieldStates"][f]["customFormState"];
        commonFormState: State["formFieldStates"][f]["commonFormState"];
      } & Value<Entity[f]> & { disabled: boolean },
      {
        customFormState: State["formFieldStates"][f]["customFormState"];
        commonFormState: State["formFieldStates"][f]["commonFormState"];
      },
      ForeignMutationsExpected & { onChange: OnChange<Entity[f]> }
    >;
    type EntityFormConfig = { [f in Fields]: FieldTemplate<f> };

    return {
      config: id<EntityFormConfig>,
      template: (
        config: EntityFormConfig,
        validation?: BasicFun<Entity, Promise<FieldValidationWithPath>>,
      ): EntityFormTemplate<
        Entity,
        Fields,
        FieldStates,
        Context,
        ForeignMutationsExpected
      > => {
        const fieldTemplates: FieldTemplates<
          Entity,
          Fields,
          FieldStates,
          Context,
          ForeignMutationsExpected
        > = {} as FieldTemplates<
          Entity,
          Fields,
          FieldStates,
          Context,
          ForeignMutationsExpected
        >;
        const setFieldTemplate = <field extends Fields>(field: field) => {
          fieldTemplates[field] = config[field]
            .mapContext<
              EntityFormContext<
                Entity,
                Fields,
                FieldStates,
                Context,
                ForeignMutationsExpected
              > & { disabled: boolean }
            >((_) => {
              // disabled flag is passed in from the wrapping container when mapping over fields
              const visibilitiesFromParent =
                _.visibilities?.kind == "form"
                  ? _.visibilities?.fields.get(field as string)!
                  : undefined;
              const elementVisibilities =
                visibilitiesFromParent?.kind == "list" ||
                visibilitiesFromParent?.kind == "map"
                  ? visibilitiesFromParent.elementValues
                  : undefined;

              const disabledFieldsFromParent =
                _.disabledFields?.kind == "form"
                  ? _.disabledFields?.fields.get(field as string)!
                  : undefined;
              const elementDisabled =
                disabledFieldsFromParent?.kind == "list" ||
                disabledFieldsFromParent?.kind == "map"
                  ? disabledFieldsFromParent.elementValues
                  : undefined;

              return {
                rootValue: _.rootValue,
                value: _.value[field],
                extraContext: _.extraContext,
                disabled: _.disabled,
                commonFormState: _.formFieldStates[field].commonFormState,
                customFormState: _.formFieldStates[field].customFormState,
                formFieldStates: _.formFieldStates[field].formFieldStates,
                elementFormStates: _.formFieldStates[field].elementFormStates,
                elementVisibilities,
                visibilities: visibilitiesFromParent,
                disabledFields: disabledFieldsFromParent,
                elementDisabled,
              } as any;
            })
            .mapState<State>((_) => (current) => {
              return {
                ...current,
                formFieldStates: {
                  ...current.formFieldStates,
                  [field]: _(current.formFieldStates[field]),
                },
              };
            })
            .mapForeignMutationsFromProps<
              EntityFormForeignMutationsExpected<
                Entity,
                Fields,
                FieldStates,
                Context,
                ForeignMutationsExpected
              >
            >((props) => ({
              ...props.foreignMutations,
              onChange: (_: BasicUpdater<Entity[field]>, path) => {
                const stateUpdater: BasicUpdater<
                  EntityFormState<
                    Entity,
                    Fields,
                    FieldStates,
                    Context,
                    ForeignMutationsExpected
                  >
                > = validation
                  ? (_) => ({
                      ..._,
                      commonFormState: {
                        ..._.commonFormState,
                        modifiedByUser: true,
                        validation:
                          Debounced.Updaters.Template.value<FormValidatorSynchronized>(
                            Synchronized.Updaters.value(replaceWith(unit)),
                          )(_.commonFormState.validation),
                      },
                      formFieldStates: {
                        ..._.formFieldStates,
                        [field]: {
                          ..._.formFieldStates[field],
                          commonFormState: {
                            ..._.formFieldStates[field].commonFormState,
                            modifiedByUser: true,
                            validation:
                              Debounced.Updaters.Template.value<FormValidatorSynchronized>(
                                Synchronized.Updaters.value(replaceWith(unit)),
                              )(_.commonFormState.validation),
                          },
                        },
                      },
                    })
                  : (_) => ({
                      ..._,
                      commonFormState: {
                        ..._.commonFormState,
                        modifiedByUser: true,
                      },
                      formFieldStates: {
                        ..._.formFieldStates,
                        [field]: {
                          ..._.formFieldStates[field],
                          commonFormState: {
                            ..._.formFieldStates[field].commonFormState,
                            modifiedByUser: true,
                          },
                        },
                      },
                    });
                setTimeout(() => {
                  props.setState(stateUpdater);
                }, 0);

                props.foreignMutations.onChange(
                  (current: Entity): Entity => ({
                    ...current,
                    [field]: _(current[field]),
                  }),
                  path.unshift(field as string),
                );
              },
            }));
        };
        Object.keys(config).forEach((_) => {
          const field = _ as Fields;
          setFieldTemplate(field);
        });
        return Template.Default<
          EntityFormContext<
            Entity,
            Fields,
            FieldStates,
            Context,
            ForeignMutationsExpected
          >,
          State,
          EntityFormForeignMutationsExpected<
            Entity,
            Fields,
            FieldStates,
            Context,
            ForeignMutationsExpected
          >,
          EntityFormView<
            Entity,
            Fields,
            FieldStates,
            Context,
            ForeignMutationsExpected
          >
        >((props) => {
          const visibleFieldKeys: OrderedSet<FieldName> = (() => {
            if (
              props.context.visibilities == undefined ||
              props.context.visibilities.kind != "form"
            )
              return OrderedSet();

            return props.context.visibilities.fields
              .filter((_) => _.value == true)
              .keySeq()
              .toOrderedSet();
          })();

          const disabledFieldKeys: OrderedSet<FieldName> = (() => {
            if (
              props.context.disabledFields == undefined ||
              props.context.disabledFields.kind != "form"
            )
              return OrderedSet(Object.keys(props.context.value as object));

            return props.context.disabledFields.fields
              .filter((_) => _.value == true)
              .keySeq()
              .toOrderedSet();
          })();

          return (
            <>
              <props.view
                {...props}
                VisibleFieldKeys={visibleFieldKeys}
                DisabledFieldKeys={disabledFieldKeys}
                EmbeddedFields={fieldTemplates}
              />
            </>
          );
        }).any([
          ValidateRunner<
            EntityFormContext<
              Entity,
              Fields,
              FieldStates,
              Context,
              ForeignMutationsExpected
            >,
            State,
            EntityFormForeignMutationsExpected<
              Entity,
              Fields,
              FieldStates,
              Context,
              ForeignMutationsExpected
            >,
            Entity
          >(validation),
        ]);
      },
    };
  },
});

// TODO: Validate runner and dirty status are also used to ensure to element is initialised, but this should be further debugged with a more correct solution
export const ValidateRunner = <
  Context,
  FormState extends { commonFormState: CommonFormState },
  ForeignMutationsExpected,
  Entity,
>(
  validation?: BasicFun<Entity, Promise<FieldValidationWithPath>>,
) => {
  const Co = CoTypedFactory<Context & Value<Entity> & FormState, FormState>();
  return Co.Template<ForeignMutationsExpected & { onChange: OnChange<Entity> }>(
    validation
      ? Co.Repeat(
          Debounce<FormValidatorSynchronized, Value<Entity>>(
            Synchronize<Unit, FieldValidationWithPath, Value<Entity>>(
              (_) => (validation ? validation(_.value) : Promise.resolve([])),
              () => "transient failure",
              3,
              50,
            ),
            50,
          ).embed(
            (_) => ({ ..._.commonFormState.validation, value: _.value }),
            (_) => (curr) => ({
              ...curr,
              commonFormState: {
                ...curr.commonFormState,
                validation: _(curr.commonFormState.validation),
              },
            }),
          ),
        )
      : Co.SetState((curr) => ({
          ...curr,
          commonFormState: {
            ...curr.commonFormState,
            validation: Debounced.Updaters.Core.dirty(
              replaceWith<DirtyStatus>("not dirty"),
            ),
          },
        })),
    {
      interval: 15,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(
          props.context.commonFormState.validation,
        ),
    },
  );
};
