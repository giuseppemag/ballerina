import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { ParentTemplate } from "./domains/parent/template";
import { Parent } from "./domains/parent/state";

function App() {
	const [parent, setParent] = useState(Parent.Default());

	return (
		<div className="App">
			<div>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Rspack + React + TypeScript</h1>
			<div className="card">
				<ParentTemplate
					context={parent}
					setState={setParent}
					foreignMutations={{}}
				/>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Rspack and React logos to learn more
			</p>
		</div>
	);
}

export default App;
