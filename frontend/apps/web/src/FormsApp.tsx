import { useState } from "react";
import "./App.css";
import { unit, FormsConfig, parseForms, FormParsingResult, Sum, builtInsFromFieldViews, FormValidationResult } from "ballerina-core";
import { Set } from "immutable";
import { PersonForm } from "./domains/person/template";
import { PersonView } from "./domains/person/views/main-view";
import { Person, PersonFormState } from "./domains/person/state";
import { PersonFormsConfig } from "./domains/person/domains/from-config/api/config-mocks";
import { FieldViews } from "./domains/person/domains/from-config/views/field-views";
import { PersonFromConfigApis } from "./domains/person/domains/from-config/api/data-mocks";
import { ContainerFormView, ShowFormSetupErrors, SubmitButtonWrapper } from "./domains/person/domains/from-config/views/wrappers";
import { PersonConfigFormsLeafPredicates } from "./domains/person/domains/from-config/state";

const validatedFormsConfig: FormValidationResult = FormsConfig.Default.validateAndParseAPIResponse(builtInsFromFieldViews(FieldViews))(PersonFormsConfig)
const parsedFormsConfig: FormParsingResult = validatedFormsConfig.kind == "l" ?
	parseForms(
		ContainerFormView,
		FieldViews,
		PersonFromConfigApis.streamApis,
		PersonFromConfigApis.enumApis,
		PersonFromConfigApis.entityApis,
		PersonConfigFormsLeafPredicates)(validatedFormsConfig.value) : Sum.Default.right([])

const PersonEditForm = parsedFormsConfig.kind == "l" ?
	parsedFormsConfig.value.edit.get("edit-person") ?? ShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig) : ShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig)

const PersonCreateForm = parsedFormsConfig.kind == "l" ?
	parsedFormsConfig.value.create.get("create-person") ?? ShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig) : ShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig)

export const FormsApp = (props: {}) => {
	const [formToShow, setFormToShow] = useState(0)
	const [personCreateFormState, setPersonCreateFormState] = useState(PersonCreateForm.initialState)
	const [personEditFormState, setPersonEditFormState] = useState(PersonEditForm.initialState)
	const forms = [
		{ form: PersonCreateForm.form, state: personCreateFormState, setState: setPersonCreateFormState },
		{ form: PersonEditForm.form, state: personEditFormState, setState: setPersonEditFormState },
	]
	const currentForm = forms[formToShow % forms.length]
	const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
	const [personState, setPersonState] = useState(Person.Default.mocked())

	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<table>
					<tbody>
						<tr>
							<td>
								<PersonForm
									context={{
										...personFormState,
										value: personState,
										formState: personEditFormState,
										person: personState,
										columns: [["name", "surname", "gender", "birthday"],
										["subscribeToNewsletter", "interests"],
										["departments", "address"]],
										visibleFields: Person.Operations.VisibleFields,
										flags: Set(["BC"]),
										showAllErrors: false,
									}}
									setState={_ => setPersonFormState(_)}
									view={PersonView}
									foreignMutations={{
										onChange: _ => setPersonState(_)
									}}
								/>
							</td>
						</tr>
						<tr>
							<td>
								<button onClick={() => setFormToShow(formToShow + 1)}>Show next form</button>
								{
									<currentForm.form
										context={{
											entityId: "abcd-1234",
											...currentForm.state,
											containerFormView: ContainerFormView,
											submitButtonWrapper: SubmitButtonWrapper,
											extraContext: {
												flags: Set(["BC", "X"])
											}
										}}
										setState={(_: any) => currentForm.setState(_)}
										foreignMutations={{ onSubmitted:(_:any) => console.log(`submitted ${_.name}`)}}
										view={unit}
									/>
								}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
