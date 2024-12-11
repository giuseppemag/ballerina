import { useState } from "react";
import "./App.css";
import { unit, FormsConfig, parseForms, FormParsingResult, Sum, builtInsFromFieldViews, FormValidationResult, EditLauncherContext, CreateLauncherContext, FormsParserState, FormRunnerState, FormsParserTemplate, PromiseRepo, FormRunnerTemplate, ApiConverters, CollectionReference, CollectionSelection } from "ballerina-core";
import { List, OrderedMap, Set } from "immutable";
import { PersonView } from "./domains/person/views/main-view";
import { PersonContainerFormView, PersonNestedContainerFormView, PersonShowFormSetupErrors, CreatePersonSubmitButtonWrapper, EditPersonSubmitButtonWrapper } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFormsConfig, PersonFromConfigApis, PersonConfigFormsLeafPredicates, PersonConfig, PersonFormState, Person } from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
import { PersonForm } from "./domains/person/template";

const ShowFormsParsingErrors = (parsedFormsConfig: FormParsingResult) =>
	<div style={{ border: "red" }}>
		{parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
	</div>

export const FormsApp = (props: {}) => {
	const [configFormsParser, setConfigFormsParser] = useState(FormsParserState.Default())
	const [formToShow, setFormToShow] = useState(0)
	const numForms = 2
	const [personCreateFormState, setPersonCreateFormState] = useState(FormRunnerState.Default())
	const [personEditFormState, setPersonEditFormState] = useState(FormRunnerState.Default())
	const [personState, setPersonState] = useState(Person.Default.mocked())
	// const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
	// const [personConfigState, setPersonConfigState] = useState(PersonConfig.Default())

	const fieldTypeConverters: ApiConverters = {
		"string": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: _ => _ },
		"number": { fromAPIRawValue: _ => typeof _ == "number" ? _ : 0, toAPIRawValue: _ => _ },
		"boolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : false, toAPIRawValue: _ => _ },
		"maybeBoolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : undefined, toAPIRawValue: _ => _ },
		"Date": { fromAPIRawValue: _ => typeof _ == "string" ? new Date(Date.parse(_)) : typeof _ == "number" ? new Date(_) : new Date(Date.now()), toAPIRawValue: _ => _ },
		"CollectionReference": {
			fromAPIRawValue: _ => CollectionReference.Default(_.id ?? "", _.displayName ?? ""),
			toAPIRawValue: _ => ({ id: _.id, displayName: _.displayName })
		},
		"SingleSelection": {
			fromAPIRawValue: _ => _ == undefined ? CollectionSelection().Default.right("no selection") :
				CollectionSelection().Default.left(
					CollectionReference.Default(_.id ?? "", _.displayName ?? "")
				),
			toAPIRawValue: _ => _.kind == "r" ? undefined : ({ id: _.value.id, displayName: _.value.displayName })
		},
		"MultiSelection": {
			fromAPIRawValue: _ => _ == undefined ? OrderedMap() : OrderedMap(_.map((_: any) => ([_.id, _]))),
			toAPIRawValue: _ => _.valueSeq().toArray()
		},
		"List": {
			fromAPIRawValue: _ => _ == undefined ? List() : List(_),
			toAPIRawValue: _ => _.valueSeq().toArray()
		},
		"Map": {
			fromAPIRawValue: _ => _ == undefined ? List() : List(_),
			toAPIRawValue: _ => _.valueSeq().toArray()
		},
	}

	console.log({
		parser: configFormsParser,
		runner: personEditFormState
	})
	const [renderParserState, renderForms] = [true, true]

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
								<FormsParserTemplate
									context={{
										...configFormsParser,
										containerFormView: PersonContainerFormView,
										fieldTypeConverters: fieldTypeConverters,
										nestedContainerFormView: PersonNestedContainerFormView,
										fieldViews: PersonFieldViews,
										infiniteStreamSources: PersonFromConfigApis.streamApis,
										enumOptionsSources: PersonFromConfigApis.enumApis,
										entityApis: PersonFromConfigApis.entityApis,
										leafPredicates: PersonConfigFormsLeafPredicates,
										getFormsConfig: () => PromiseRepo.Default.mock(() => PersonFormsConfig)
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
														onSubmitted(_: any) {
															alert(`Submitted new person ${JSON.stringify(_)}`)
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
