import { useState } from "react";
import "./App.css";
import { unit, FormsConfig, parseForms, FormParsingResult, Sum, builtInsFromFieldViews, FormValidationResult, EditLauncherContext, CreateLauncherContext } from "ballerina-core";
import { Set } from "immutable";
import { PersonView } from "./domains/person/views/main-view";
import { PersonContainerFormView, PersonShowFormSetupErrors, PersonSubmitButtonWrapper } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFormsConfig, PersonFromConfigApis, PersonConfigFormsLeafPredicates, PersonConfig, PersonFormState, Person } from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
import { PersonForm } from "./domains/person/template";

const validatedFormsConfig: FormValidationResult = FormsConfig.Default.validateAndParseAPIResponse(builtInsFromFieldViews(PersonFieldViews))(PersonFormsConfig)
const parsedFormsConfig: FormParsingResult = validatedFormsConfig.kind == "l" ?
	parseForms(
		PersonContainerFormView,
		PersonFieldViews,
		PersonFromConfigApis.streamApis,
		PersonFromConfigApis.enumApis,
		PersonFromConfigApis.entityApis,
		PersonConfigFormsLeafPredicates)(validatedFormsConfig.value) : Sum.Default.right([])

const MaybePersonEditForm = parsedFormsConfig.kind == "l" ?
	parsedFormsConfig.value.edit.get("edit-person") ?? undefined : undefined
const PersonEditForm =
	MaybePersonEditForm != undefined ? MaybePersonEditForm<any, any, any, EditLauncherContext<any, any, any>>()
		: PersonShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig)

const MaybePersonCreateForm = parsedFormsConfig.kind == "l" ?
	parsedFormsConfig.value.create.get("create-person") ?? undefined : undefined
const PersonCreateForm =
	MaybePersonCreateForm != undefined ? MaybePersonCreateForm<any, any, any, CreateLauncherContext<any, any, any>>()
		: PersonShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig)


export const FormsApp = (props: {}) => {
	const [formToShow, setFormToShow] = useState(0)
	const [personCreateFormState, setPersonCreateFormState] = useState(PersonCreateForm.initialState)
	const [personEditFormState, setPersonEditFormState] = useState(PersonEditForm.initialState)
	const forms = [
		{
			form: PersonCreateForm.form, state: personCreateFormState, setState: setPersonCreateFormState,
			container: PersonContainerFormView, submitButtonWrapper: PersonSubmitButtonWrapper
		},
		{
			form: PersonEditForm.form, state: personEditFormState, setState: setPersonEditFormState,
			container: PersonContainerFormView, submitButtonWrapper: PersonSubmitButtonWrapper
		},
	]
	const currentForm = forms[formToShow % forms.length]
	const [personState, setPersonState] = useState(Person.Default.mocked())
	const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
	const [personConfigState, setPersonConfigState] = useState(PersonConfig.Default())

	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<table>
					<tbody>
						<tr>
							<td>
								{/* { JSON.stringify(personFormState.address.elementFormStates.toArray()) } */}
								<PersonForm
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
								/>
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
								<button onClick={() => setFormToShow(formToShow + 1)}>Show next form</button>
								{
									<currentForm.form
										context={{
											entityId: "abcd-1234",
											...currentForm.state,
											containerFormView: currentForm.container,
											submitButtonWrapper: currentForm.submitButtonWrapper,
											extraContext: {
												flags: Set(["BC", "X"])
											}
										} as any}
										setState={(_) => currentForm.setState(_)}
										foreignMutations={{ onSubmitted: (_: any) => console.log(`submitted ${_.name}`) }}
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
