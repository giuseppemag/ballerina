import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { ParentTemplate } from "./domains/parent/template";
import { Parent } from "./domains/parent/state";
import { Uncle } from "./domains/uncle/state";
import { UncleTemplate } from "./domains/uncle/template";
import { OrderedMap } from "immutable";

function App() {
	const [parent, setParent] = useState(Parent.Default());
	const [uncle, setUncle] = useState(Uncle.Default());
	const uncleForeignMutations = Uncle.ForeignMutations({ context:uncle, setState:setUncle })

	return (
		<div className="App">
			<div>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Rspack + React + TypeScript</h1>
			<div className="card">
				<UncleTemplate
					context={uncle}
					setState={setUncle}
					foreignMutations={{}}
				/>
				<ParentTemplate
					context={parent}
					setState={setParent}
					foreignMutations={{
						setFlag:uncleForeignMutations.overrideFlag
					}}
				/>
			</div>
		</div>
	);
}

export default App;
