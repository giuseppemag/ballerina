import { useEffect, useState } from "react";
import "./App.css";
import { unit, PromiseRepo, IntegratedFormsParserState, IntegratedFormsParserTemplate, IntegratedFormRunnerState, IntegratedFormRunnerTemplate, IntegratedFormParsingResult, PredicateValue, Sum, Updater, replaceWith } from "ballerina-core";
import { List, Set, Map } from "immutable";
import { PersonContainerFormView, PersonNestedContainerFormView } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFromConfigApis,} from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
import { fieldTypeConverters } from "./domains/person/apis/field-converters";
import { categoryForm, CategoryState, PersonFormInjectedTypes } from "./domains/person-from-config/injected-forms/category";
import IntegratedFormConfig from "../../../../backend/apps/ballerina-runtime/input-forms/integrated/integrated-form.json"
import { IntegratedFormContainerWrapper } from "./domains/integrated-form/views/wrappers";
import { IntegratedFormApi } from "./domains/integrated-form/apis/mocks";

const ShowIntegratedFormParsingErrors = (parsedFormsConfig: IntegratedFormParsingResult) =>
	<div style={{ border: "red" }}>
		{parsedFormsConfig.kind == "errors" && JSON.stringify(parsedFormsConfig.errors)}
	</div>

const InstantiedIntegratedFormParserTemplate = IntegratedFormsParserTemplate<PersonFormInjectedTypes>()
const InstantiedIntegratedFormRunnerTemplate = IntegratedFormRunnerTemplate<PersonFormInjectedTypes>()
export const IntegratedFormsApp = (props: {}) => {
	const [configFormsParser, setConfigFormsParser] = useState(IntegratedFormsParserState.Default())
	const [integratedFormState, setIntegratedFormState] = useState(IntegratedFormRunnerState<PersonFormInjectedTypes>().Default())
	const [initialRawEntity, setInitialRawEntity] = useState<Sum<any, "not initialized">>(Sum.Default.right("not initialized"))
    const [entity, setEntity] = useState<Sum<PersonFormInjectedTypes, "not initialized">>(Sum.Default.right("not initialized"))
	const [globalConfiguration, setGlobalConfiguration] = useState<Sum<PredicateValue, "not initialized">>(Sum.Default.right("not initialized"))

	const [entityPath, setEntityPath] = useState<List<string>>(List())

	useEffect(() => {
		IntegratedFormApi.getRawData().then(
			(raw) => {
				if(integratedFormState.form.kind == "r") {
					return
				}
				const parsed = integratedFormState.form.value.fromApiParser(raw)
				setEntity(Sum.Default.left(parsed))
				if(initialRawEntity.kind == "r") {
					setInitialRawEntity(Sum.Default.left(raw))
				}
			}
		)
		IntegratedFormApi.getGlobalConfiguration().then(
			(raw) => {
				if(integratedFormState.form.kind == "r") {
					return
				}
				const parsed = integratedFormState.form.value.parseGlobalConfiguration(raw)
				if(parsed.kind == "errors") {
					console.error(parsed.errors)
				} else {
					setGlobalConfiguration(Sum.Default.left(parsed.value))
				}
			}
		)
	}, [integratedFormState.form.kind])

	const [renderParserState, renderForms] = [true, true]
	const logState = true

	logState && console.log({
		parser: configFormsParser,
		runner: integratedFormState
	})

    const onRawEntityChange = (updater: Updater<any>, path: List<string>): void => {
		if(integratedFormState.form.kind == "r")
			return
		const newEntity = updater(entity.value)
        setEntity(replaceWith(Sum.Default.left(newEntity)))
		setEntityPath(path)
		setTimeout(() => {
			if(integratedFormState.form.kind == "r" || entity.kind == "r")
				return
			const patch = integratedFormState.form.value.toApiParser(entity.value, integratedFormState.form.value, false)
			if(patch.kind == "errors") {
				console.error(patch.errors)
			} else {
				console.log("patching", patch.value)
			}
		}, 0)
    }

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
											<p>Path: {JSON.stringify(entityPath)}</p>								
												<InstantiedIntegratedFormRunnerTemplate
													context={{
														...configFormsParser,
														...integratedFormState,
														containerWrapper: IntegratedFormContainerWrapper,
														entity,
														initialRawEntity,
														globalConfiguration,
														formRef: {
															formName: "integrated-form",
														},
														showFormParsingErrors: ShowIntegratedFormParsingErrors,
														extraContext: {
															flags: Set(["BC", "X"]),
														},
													}}
													setState={setIntegratedFormState}
													view={unit}
													foreignMutations={{
														onRawEntityChange
													}}
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
