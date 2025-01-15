import { useState } from "react";
import "./App.css";
import { unit, FormsConfig, parseForms, FormParsingResult, Sum, builtInsFromFieldViews, FormValidationResult, EditLauncherContext, CreateLauncherContext, FormsParserState, FormRunnerState, FormsParserTemplate, PromiseRepo, FormRunnerTemplate, BuiltInApiConverters, CollectionReference, CollectionSelection } from "ballerina-core";
import { List, OrderedMap, Set, Map } from "immutable";
import { PersonView } from "./domains/person/views/main-view";
import { PersonContainerFormView, PersonNestedContainerFormView, PersonShowFormSetupErrors, CreatePersonSubmitButtonWrapper, EditPersonSubmitButtonWrapper } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFormsConfig, PersonFromConfigApis, PersonConfigFormsLeafPredicates, PersonConfig, PersonFormState, Person } from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
import { PersonForm } from "./domains/person/template";
import { fieldTypeConverters, modifiedDebugFieldTypeConverters } from "./domains/person/apis/field-converters";
import { categoryForm, CategoryState, PersonFormInjectedTypes } from "./domains/person-from-config/injected-forms/category";

const ShowFormsParsingErrors = (parsedFormsConfig: FormParsingResult) =>
	<div style={{ border: "red" }}>
		{parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
	</div>

const InstantiedPersonFormsParserTemplate = FormsParserTemplate<PersonFormInjectedTypes>()

export const FormsApp = (props: {}) => {
	const [configFormsParser, setConfigFormsParser] = useState(FormsParserState.Default())
	const [formToShow, setFormToShow] = useState(0)
	const numForms = 2
	const [personCreateFormState, setPersonCreateFormState] = useState(FormRunnerState.Default())
	const [personEditFormState, setPersonEditFormState] = useState(FormRunnerState.Default())
	const [personState, setPersonState] = useState(Person.Default.mocked())
	// const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
	// const [personConfigState, setPersonConfigState] = useState(PersonConfig.Default())

	const [renderParserState, renderForms] = [true, true]
	const debugFieldTypeConverters = false
	const logState = true

	logState && console.log({
		parser: configFormsParser,
		runner: formToShow % numForms == 0 ? personCreateFormState : personEditFormState
	})

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
								{/* <MappedPersonForm
									context={{
										...personFormState,
										value: personConfigState,
										formState: personFormState,
										person: personConfigToPersonMapping.from(personConfigState),
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
											setPersonConfigState(_)
											console.log(path.toArray())
										}
									}}
								/> */}
							</td>
						</tr>
						<tr>
							<td>
								{renderParserState && JSON.stringify(configFormsParser)}
								<button onClick={() => setFormToShow(formToShow + 1)}>Show next form</button>
								<InstantiedPersonFormsParserTemplate
									context={{
										...configFormsParser,
										containerFormView: PersonContainerFormView,
										fieldTypeConverters: debugFieldTypeConverters ? modifiedDebugFieldTypeConverters : fieldTypeConverters,
										nestedContainerFormView: PersonNestedContainerFormView,
										fieldViews: PersonFieldViews,
										infiniteStreamSources: PersonFromConfigApis.streamApis,
										enumOptionsSources: PersonFromConfigApis.enumApis,
										entityApis: PersonFromConfigApis.entityApis,
										leafPredicates: PersonConfigFormsLeafPredicates,
										getFormsConfig: () => PromiseRepo.Default.mock(() => PersonFormsConfig),
										injectedPrimitives: Map([["injectedCategory", {fieldView: categoryForm, defaultValue: {category: "adult", kind: "category"}, defaultState: CategoryState.Default() }]]),
									}}
									setState={setConfigFormsParser}
									view={unit}
									foreignMutations={unit}
								/>
								{
									renderForms && formToShow % numForms == 0 ?
										<>
											<h3>Create person</h3>
											<FormRunnerTemplate
												context={{
													...configFormsParser,
													...personCreateFormState,
													formRef: {
														formName: "create-person",
														kind: "create",
														submitButtonWrapper: CreatePersonSubmitButtonWrapper,
														apiHandlers: {
															success: (_) => {
																alert(`Submitted new person ${JSON.stringify(_)}`)
															},
															error: (_) => {
																alert(`Error submitting new person ${JSON.stringify(_)}`)
															}
														}
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
										: renderForms && formToShow % numForms == 1 ?
											<>
												<h3>Edit person</h3>
												<FormRunnerTemplate
													context={{
														...configFormsParser,
														...personEditFormState,
														formRef: {
															formName: "edit-person",
															entityId: "abcd-1234",
															kind: "edit",
															submitButtonWrapper: EditPersonSubmitButtonWrapper,
															apiHandlers: {
																success: (_) => {
																	console.log({ type: 'success', 'data': _ })
																},
																error: (_) => {
																	console.log({ type: 'error', 'msg': _ })
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
											: undefined
								}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
