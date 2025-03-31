import { useEffect, useState } from "react";
import "./App.css";
import {
  unit,
  FormLaunchersResult,
  FormsParserState,
  FormRunnerState,
  FormsParserTemplate,
  PromiseRepo,
  FormRunnerTemplate,
  Sum,
  PredicateValue,
  replaceWith,
  Updater,
} from "ballerina-core";
import { List, Set, Map } from "immutable";
// import { PersonView } from "./domains/person/views/main-view";
import {
  PersonContainerFormView,
  PersonNestedContainerFormView,
  CreatePersonSubmitButtonWrapper,
  EditPersonSubmitButtonWrapper,
} from "./domains/person/domains/from-config/views/wrappers";
import { PersonFromConfigApis, Person } from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
// import { PersonForm } from "./domains/person/template";
import { fieldTypeConverters } from "./domains/person/apis/field-converters";
import {
  categoryForm,
  CategoryState,
  PersonFormInjectedTypes,
} from "./domains/person-from-config/injected-forms/category";
import PersonConfig from "../../../../backend/apps/automatic-tests/input-forms/person-config.json";
import { PassthroughFormContainerWrapper } from "./domains/passthrough-forms/views/wrappers";

const ShowFormsParsingErrors = <
  T extends { [key in keyof T]: { type: any; state: any } },
>(
  parsedFormsConfig: FormLaunchersResult<T>,
) => (
  <div style={{ border: "red" }}>
    {parsedFormsConfig.kind == "errors" &&
      JSON.stringify(parsedFormsConfig.errors)}
  </div>
);

const InstantiedPersonFormsParserTemplate =
  FormsParserTemplate<PersonFormInjectedTypes>();

const InstantiedPersonFormRunnerTemplate =
  FormRunnerTemplate<PersonFormInjectedTypes>();

export const FormsApp = (props: {}) => {
  const [configFormsParser, setConfigFormsParser] = useState(
    FormsParserState<PersonFormInjectedTypes>().Default(),
  );
  const [formToShow, setFormToShow] = useState(1);
  const numForms = 3;
  const [personCreateFormState, setPersonCreateFormState] = useState(
    FormRunnerState<PersonFormInjectedTypes>().Default(),
  );
  const [personEditFormState, setPersonEditFormState] = useState(
    FormRunnerState<PersonFormInjectedTypes>().Default(),
  );
  const [personPassthroughFormState, setPersonPassthroughFormState] = useState(
    FormRunnerState<PersonFormInjectedTypes>().Default(),
  );
  const [personState, setPersonState] = useState(Person.Default.mocked());
  const [formErrors, setFormErrors] = useState<List<string>>(List());
  const [formSuccess, setFormSuccess] = useState(false);
  // const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
  // const [personConfigState, setPersonConfigState] = useState(PersonConfig.Default())

  const [renderParserState, renderForms] = [true, true];
  const logState = true;

  logState &&
    console.log({
      parser: configFormsParser,
      runner:
        formToShow % numForms == 0
          ? personCreateFormState
          : personEditFormState,
    });

  if (
    configFormsParser.formsConfig.sync.kind == "loaded" &&
    configFormsParser.formsConfig.sync.value.kind == "errors"
  ) {
    return (
      <ol>
        {configFormsParser.formsConfig.sync.value.errors.map((_: string) => (
          <li>{_}</li>
        ))}
      </ol>
    );
  }

  // Passthrough form only
  const [entity, setEntity] = useState<Sum<PredicateValue, "not initialized">>(
    Sum.Default.right("not initialized"),
  );
  const [globalConfiguration, setGlobalConfiguration] = useState<
    Sum<PredicateValue, "not initialized">
  >(Sum.Default.right("not initialized"));
  const [entityPath, setEntityPath] = useState<List<string>>(List());

  const onEntityChange = (updater: Updater<any>, path: List<string>): void => {
    if (personPassthroughFormState.form.kind == "r") return;
    setTimeout(() => {}, 500);
    if (
      personPassthroughFormState.form.kind == "l" &&
      personPassthroughFormState.form.value.kind == "passthrough"
    ) {
      const newEntity = updater(entity.value);
      console.log("patching entity", newEntity);
      setEntity(replaceWith(Sum.Default.left(newEntity)));
      setEntityPath(path);
      const patchedEntity =
        personPassthroughFormState.form.value.parseEntityToApi(
          personPassthroughFormState.form.value.type,
          newEntity,
          // TODO: fix this
          personPassthroughFormState.form.value as any,
        );
      console.debug("patched entity", patchedEntity);
    }
  };

  useEffect(() => {
    if (formToShow % numForms == 2) {
      PersonFromConfigApis.entityApis
        .get("person")("")
        .then((raw) => {
          if (
            configFormsParser.formsConfig.sync.kind == "loaded" &&
            configFormsParser.formsConfig.sync.value.kind == "value"
          ) {
            const parsed =
              configFormsParser.formsConfig.sync.value.value.launchers.passthrough
                .get("person-transparent")!
                .parseEntityFromApi(raw);
            if (parsed.kind == "errors") {
              console.error(parsed.errors);
            } else {
              setEntity(Sum.Default.left(parsed.value));
            }
          }
        });
      PersonFromConfigApis.entityApis
        .get("globalConfiguration")("")
        .then((raw) => {
          if (
            configFormsParser.formsConfig.sync.kind == "loaded" &&
            configFormsParser.formsConfig.sync.value.kind == "value"
          ) {
            const parsed =
              configFormsParser.formsConfig.sync.value.value.launchers.passthrough
                .get("person-transparent")!
                .parseGlobalConfigurationFromApi(raw);
            if (parsed.kind == "errors") {
              console.error(parsed.errors);
            } else {
              setGlobalConfiguration(Sum.Default.left(parsed.value));
            }
          }
        });
    }
  }, [personPassthroughFormState.form.kind, formToShow]);

  if (
    configFormsParser.formsConfig.sync.kind == "loaded" &&
    configFormsParser.formsConfig.sync.value.kind == "errors"
  ) {
    return (
      <div>
        {JSON.stringify(configFormsParser.formsConfig.sync.value.errors)}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Ballerina 🩰</h1>
      <div className="card">
        <table>
          <tbody>
            <tr>
              <td>
                {/* { JSON.stringify(personFormState.address.elementFormStates.toArray()) } */}
                {/* <PersonForm
									context={{
										...personFormState,
										value: personState,
										formState: personFormState,
										person: personState,
										columns: [["name", "surname", "gender", "birthday"],
										["subscribeToNewsletter", "interests"],
										["departments", "address"]],
										visibleFields: Person.Operations.VisibleFields,
										disabledFields: Person.Operations.VisibleFields,
										flags: Set(["BC"]),
										showAllErrors: false,
									}}
									setState={_ => setPersonFormState(_)}
									view={PersonView}
									foreignMutations={{
										onChange: (_, path) => {
											setPersonState(_)
											console.log(path.toArray())
										}
									}}
								/> */}
                {/* {JSON.stringify(personConfigState)} */}
              </td>
            </tr>
            <tr>
              <td>
                {renderParserState && JSON.stringify(configFormsParser)}
                <button
                  onClick={() => {
                    setFormErrors(List());
                    setFormSuccess(false);
                    setFormToShow(formToShow + 1);
                  }}
                >
                  Show next form
                </button>
                <InstantiedPersonFormsParserTemplate
                  context={{
                    ...configFormsParser,
                    containerFormView: PersonContainerFormView,
                    fieldTypeConverters: fieldTypeConverters,
                    nestedContainerFormView: PersonNestedContainerFormView,
                    fieldViews: PersonFieldViews,
                    infiniteStreamSources: PersonFromConfigApis.streamApis,
                    enumOptionsSources: PersonFromConfigApis.enumApis,
                    entityApis: PersonFromConfigApis.entityApis,
                    getFormsConfig: () =>
                      PromiseRepo.Default.mock(() => PersonConfig),
                    injectedPrimitives: Map([
                      [
                        "injectedCategory",
                        {
                          fieldView: categoryForm,
                          defaultValue: "adult",
                          defaultState: CategoryState.Default(),
                        },
                      ],
                    ]),
                  }}
                  setState={setConfigFormsParser}
                  view={unit}
                  foreignMutations={unit}
                />
                {renderForms && formToShow % numForms == 0 ? (
                  <>
                    <h3>Create person</h3>
                    {formErrors.size > 0 && (
                      <div style={{ border: "2px solid red" }}>
                        <p style={{ color: "red" }}>Errors</p>
                        <ul>
                          {formErrors.map((_, i) => (
                            <li key={i}>{_}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formSuccess && (
                      <div style={{ border: "2px solid green" }}>
                        Form successfully submitted
                      </div>
                    )}
                    <InstantiedPersonFormRunnerTemplate
                      context={{
                        ...configFormsParser,
                        ...personCreateFormState,
                        formRef: {
                          formName: "create-person",
                          kind: "create",
                          submitButtonWrapper: CreatePersonSubmitButtonWrapper,
                          apiHandlers: {
                            onDefaultSuccess: (_) => {
                              console.log(
                                `Success getting default person ${JSON.stringify(
                                  _,
                                )}`,
                              );
                            },
                            onDefaultError: (_) => {
                              setFormSuccess(false);
                              setFormErrors(
                                List(["Error getting default person"]),
                              );
                              console.log(
                                `Error getting default person ${JSON.stringify(
                                  _,
                                )}`,
                              );
                            },
                            onCreateError: (_) => {
                              console.log(_);
                              setFormSuccess(false);
                              setFormErrors(List(["Error creating person"]));
                              console.log(
                                `Error submitting new person ${JSON.stringify(
                                  _,
                                )}`,
                              );
                            },
                            onCreateSuccess: (_) => {
                              setFormSuccess(true);
                              setFormErrors(List());
                              console.log(
                                `Success creating person ${JSON.stringify(
                                  _.entity.sync.value,
                                )}`,
                              );
                            },
                          },
                        },
                        showFormParsingErrors: ShowFormsParsingErrors,
                        extraContext: {
                          flags: Set(["BC", "X"]),
                        },
                      }}
                      setState={setPersonCreateFormState}
                      view={unit}
                      foreignMutations={unit}
                    />
                  </>
                ) : renderForms && formToShow % numForms == 1 ? (
                  <>
                    <h3>Edit person</h3>
                    {formErrors.size > 0 && (
                      <div style={{ border: "2px solid red" }}>
                        <p style={{ color: "red" }}>Errors</p>
                        <ul>
                          {formErrors.map((_, i) => (
                            <li key={i}>{_}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formSuccess && (
                      <div style={{ border: "2px solid green" }}>
                        Form successfully submitted
                      </div>
                    )}
                    <InstantiedPersonFormRunnerTemplate
                      context={{
                        ...configFormsParser,
                        ...personEditFormState,
                        formRef: {
                          formName: "edit-person",
                          entityId: "abcd-1234",
                          kind: "edit",
                          submitButtonWrapper: EditPersonSubmitButtonWrapper,
                          apiHandlers: {
                            onGetError: (_) => {
                              setFormSuccess(false);
                              setFormErrors(List(["Error getting person"]));
                              console.log(
                                `Error getting person ${JSON.stringify(_)}`,
                              );
                            },
                            onGetSuccess: (_) => {
                              console.log(
                                `Success getting person ${JSON.stringify(_)}`,
                              );
                            },
                            onUpdateError: (_) => {
                              console.log(_);
                              setFormSuccess(false);
                              setFormErrors(List(["Error updating person"]));
                              console.log({ type: "error", msg: _ });
                            },
                            onUpdateSuccess: (_) => {
                              setFormSuccess(true);
                              setFormErrors(List());
                              console.log({ type: "success", data: _ });
                            },
                          },
                        },
                        showFormParsingErrors: ShowFormsParsingErrors,
                        extraContext: {
                          flags: Set(["BC", "X"]),
                        },
                      }}
                      setState={setPersonEditFormState}
                      view={unit}
                      foreignMutations={unit}
                    />
                  </>
                ) : renderForms && formToShow % numForms == 2 ? (
                  <>
                    <h3>Passthrough form</h3>
                    <p>Path: {JSON.stringify(entityPath)}</p>
                    <InstantiedPersonFormRunnerTemplate
                      context={{
                        ...configFormsParser,
                        ...personPassthroughFormState,
                        formRef: {
                          formName: "person-transparent",
                          kind: "passthrough",
                          containerWrapper: PassthroughFormContainerWrapper,
                          entity,
                          globalConfiguration,
                          onEntityChange,
                        },
                        showFormParsingErrors: ShowFormsParsingErrors,
                        extraContext: {
                          flags: Set(["BC", "X"]),
                        },
                      }}
                      setState={setPersonPassthroughFormState}
                      view={unit}
                      foreignMutations={unit}
                    />
                  </>
                ) : undefined}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
