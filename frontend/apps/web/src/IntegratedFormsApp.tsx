import { useState } from "react";
import "./App.css";
import { unit, FormParsingResult, FormsParserState, FormRunnerState, FormsParserTemplate, PromiseRepo, FormRunnerTemplate, IntegratedFormsParserState, IntegratedFormsParserTemplate, IntegratedFormTemplate, IntegratedFormRunnerState, IntegratedFormRunnerTemplate, IntegratedFormParsingResult } from "ballerina-core";
import { List, Set, Map } from "immutable";
// import { PersonView } from "./domains/person/views/main-view";
import { PersonContainerFormView, PersonNestedContainerFormView, CreatePersonSubmitButtonWrapper, EditPersonSubmitButtonWrapper } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFromConfigApis, PersonConfigFormsLeafPredicates, Person } from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
// import { PersonForm } from "./domains/person/template";
import { fieldTypeConverters } from "./domains/person/apis/field-converters";
import { categoryForm, CategoryState, PersonFormInjectedTypes } from "./domains/person-from-config/injected-forms/category";
import IntegratedFormConfig from "../../../../backend/apps/ballerina-runtime/input-forms/integrated/integrated-form.json"

const ShowIntegratedFormParsingErrors = (parsedFormsConfig: IntegratedFormParsingResult) =>
	<div style={{ border: "red" }}>
		{parsedFormsConfig.kind == "errors" && JSON.stringify(parsedFormsConfig.errors)}
	</div>

const InstantiedIntegratedFormParserTemplate = IntegratedFormsParserTemplate<PersonFormInjectedTypes>()
export const IntegratedFormsApp = (props: {}) => {
	const [configFormsParser, setConfigFormsParser] = useState(IntegratedFormsParserState.Default())
	const [integratedFormState, setIntegratedFormState] = useState(IntegratedFormRunnerState.Default())
	// const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
	// const [personConfigState, setPersonConfigState] = useState(PersonConfig.Default())

	const [renderParserState, renderForms] = [true, true]
	const logState = true

	logState && console.log({
		parser: configFormsParser,
		runner: integratedFormState
	})



	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<table>
					<tbody>
						<tr>
							<td>
								{renderParserState && JSON.stringify(configFormsParser)}
								<InstantiedIntegratedFormParserTemplate
									context={{
										...configFormsParser,
										containerFormView: PersonContainerFormView,
										fieldTypeConverters: fieldTypeConverters,
										nestedContainerFormView: PersonNestedContainerFormView,
										fieldViews: PersonFieldViews,
										infiniteStreamSources: PersonFromConfigApis.streamApis,
										enumOptionsSources: PersonFromConfigApis.enumApis,
										getFormsConfig: () => PromiseRepo.Default.mock(() => IntegratedFormConfig),
										injectedPrimitives: Map([["injectedCategory", {fieldView: categoryForm, defaultValue: {category: "adult", kind: "category"}, defaultState: CategoryState.Default() }]]),
									}}
									setState={setConfigFormsParser}
									view={unit}
									foreignMutations={unit}
								/>
								
										<>
											<h3>Integrated form</h3>
											<IntegratedFormRunnerTemplate
												context={{
													...configFormsParser,
													...integratedFormState,
													formRef: {
														formName: "create-person",
													},
													showFormParsingErrors: ShowIntegratedFormParsingErrors,
													extraContext: {
														flags: Set(["BC", "X"]),
													},
												}}
												setState={setIntegratedFormState}
												view={unit}
												foreignMutations={unit}
											/>
										</>

							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
