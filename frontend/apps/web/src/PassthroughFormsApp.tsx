import { useEffect, useState } from "react";
import "./App.css";
import { unit, PromiseRepo, PassthroughFormRunnerState, PassthroughFormRunnerTemplate, PredicateValue, Sum, Updater, replaceWith, FormParsingResult, FormsParserTemplate, FormsParserState } from "ballerina-core";
import { List, Set, Map } from "immutable";
import { PersonContainerFormView, PersonNestedContainerFormView } from "./domains/person/domains/from-config/views/wrappers";
import { PersonFromConfigApis,} from "playground-core";
import { PersonFieldViews } from "./domains/person-from-config/views/field-views";
import { fieldTypeConverters } from "./domains/person/apis/field-converters";
import { categoryForm, CategoryState, PersonFormInjectedTypes } from "./domains/person-from-config/injected-forms/category";
import PersonConfig from "../../../../backend/apps/ballerina-runtime/input-forms/person-config.json"
import { IntegratedFormContainerWrapper } from "./domains/passthrough-forms/views/wrappers";
import { Patcher } from "./domains/passthrough-forms/coroutines/patcher";

const ShowFormsParsingErrors = (parsedFormsConfig: FormParsingResult) =>
	<div style={{ border: "red" }}>
		{parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
	</div>



const InstantiedPatcher = Patcher<PersonFormInjectedTypes>()
const InstantiedPersonFormsParserTemplate = FormsParserTemplate<PersonFormInjectedTypes>()

const InstantiedIntegratedFormRunnerTemplate = PassthroughFormRunnerTemplate<PersonFormInjectedTypes>()
export const PassthroughFormsApp = (props: {}) => {
	const [configFormsParser, setConfigFormsParser] = useState(FormsParserState.Default())
	const [integratedFormState, setIntegratedFormState] = useState(PassthroughFormRunnerState<PersonFormInjectedTypes>().Default())
	const [initialRawEntity, setInitialRawEntity] = useState<Sum<any, "not initialized">>(Sum.Default.right("not initialized"))
    const [entity, setEntity] = useState<Sum<PersonFormInjectedTypes, "not initialized">>(Sum.Default.right("not initialized"))
	const [globalConfiguration, setGlobalConfiguration] = useState<Sum<PredicateValue, "not initialized">>(Sum.Default.right("not initialized"))
	

	const [entityPath, setEntityPath] = useState<List<string>>(List())

	useEffect(() => {
		PersonFromConfigApis.entityApis.get("person")("").then(
			(raw) => {
				if(configFormsParser.formsConfig.sync.kind == "loaded" && configFormsParser.formsConfig.sync.value.kind == "l"){
					const parsed: any = configFormsParser.formsConfig.sync.value.value.passthrough.get("person-transparent")!().fromApiParser(raw)
					setEntity(Sum.Default.left(parsed))
					if(initialRawEntity.kind == "r") {
					setInitialRawEntity(Sum.Default.left(raw))
					}
				}
			}
		)
		PersonFromConfigApis.entityApis.get("globalConfiguration")("").then(
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
		runner: integratedFormState,
		entity: entity.value
	})

    const onRawEntityChange = (updater: Updater<any>, path: List<string>): void => {
		if(integratedFormState.form.kind == "r")
			return
		const newEntity = updater(entity.value)
        setEntity(replaceWith(Sum.Default.left(newEntity)))
		setEntityPath(path)
		setIntegratedFormState(PassthroughFormRunnerState<PersonFormInjectedTypes>().Updaters.shouldUpdate(replaceWith(true)))
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
										getFormsConfig: () => PromiseRepo.Default.mock(() => PersonConfig),
										injectedPrimitives: Map([["injectedCategory", {fieldView: categoryForm, defaultValue: {category: "adult", kind: "category"}, defaultState: CategoryState.Default() }]]),
									}}
									setState={setConfigFormsParser}
									view={unit}
									foreignMutations={unit}
								/>
								<InstantiedPatcher
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
										showFormParsingErrors: ShowFormsParsingErrors,
										extraContext: {
											flags: Set(["BC", "X"]),
										},
									}}
									setState={setIntegratedFormState}
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
															formName: "person-transparent",
														},
														showFormParsingErrors: ShowFormsParsingErrors,
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
