import { useState } from "react";
import "./App.css";
import { UncleTemplate, ParentTemplate2, Uncle, Parent } from "playground-core";
import { ParentLayout2 } from "./domains/parent/views/parentLayout2";
import { UncleLayout } from "./domains/uncle/views/uncleLayout";
import { FormsApp } from "./FormsApp";

function App(props: { showForms:boolean }) {
	const [uncle, setUncle] = useState(Uncle.Default())
	const [parent, setParent] = useState(Parent.Default())
	const uncleForeignMutations = Uncle.ForeignMutations({ setState:setUncle, context:uncle })

	if (props.showForms) return FormsApp({})
	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<table>
					<tbody>
						<tr>
							<td>
								<UncleTemplate
									context={uncle}
									setState={setUncle}
									foreignMutations={{}}
									view={UncleLayout}
								/>
							</td>
						</tr>
						<tr>
							<td>
								<ParentTemplate2
									context={parent}
									setState={setParent}
									foreignMutations={{
										setFlag: uncleForeignMutations.overrideFlag
									}}
									view={ParentLayout2}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default App;
