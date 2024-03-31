import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { BasicFun, Fun } from "./domains/core/fun/state";
import { caseUpdater } from "./domains/core/fun/domains/updater/domains/caseUpdater/state";
import { simpleUpdater } from "./domains/core/fun/domains/updater/domains/simpleUpdater/state";
import { id } from "./domains/core/fun/domains/id/state";

type C1 = { Kind:"C1", value:number, otherValue:number }
const C1 = {
  Updaters:{
    ...simpleUpdater<C1>()("value"),
    ...simpleUpdater<C1>()("otherValue"),
  }
}
type C2 = { Kind:"C2", value:string }
const C2 = {
  Updaters:{
    ...simpleUpdater<C2>()("value")
  }
}
type C3 = { Kind:"C3", value:boolean }
const C3 = {
  Updaters:{
    ...simpleUpdater<C3>()("value")
  }
}
type U = C1 | C2 | C3
const U = {
  Updaters:{
    ...caseUpdater<U>()("C1"),
    ...caseUpdater<U>()("C2"),
    ...caseUpdater<U>()("C3"),
  }
}

U.Updaters.C1(
	C1.Updaters.value(_ => _ + 1).then(
	C1.Updaters.otherValue(_ => _ * 2))
).then(
	U.Updaters.C2(C2.Updaters.value(_ => _ + "!"))
).then(
	U.Updaters.C3(C3.Updaters.value(_ => !_))
)

type Sum<a,b> = { value:a, kind:"l" } | { value:b, kind:"r" }
const Sum = {
	create:{
		l:<a,b>() : Fun<a,Sum<a,b>> => Fun(_ => ({ value:_, kind:"l"})),
		r:<a,b>() : Fun<b,Sum<a,b>> => Fun(_ => ({ value:_, kind:"r"})),
	},
  fold:<a,b,c,>(l:BasicFun<a,c>, r:BasicFun<b,c>) : Fun<Sum<a,b>,c> => Fun(_ => _.kind == "l" ? l(_.value) : r(_.value)),
  embed:{
    array:<a,b>() : Fun<Sum<Array<a>,Array<b>>, Array<Sum<a,b>>> => Fun(_ => Sum.fold<Array<a>,Array<b>,Array<Sum<a,b>>>(
			Array.map(Sum.create.l()), 
			Array.map(Sum.create.r())
		)(_)),
  },
  map2:<a,b,a1,b1,>(l:BasicFun<a,a1>, r:BasicFun<b,b1>) : Fun<Sum<a,b>,Sum<a1,b1>> => 
		Sum.fold<a,b,Sum<a1,b1>>(Fun(l).then(Sum.create.l()), Fun(r).then(Sum.create.r()))
}

const Array = {
	map:<a,b>(f:BasicFun<a,b>) : Fun<Array<a>, Array<b>> => Fun(_ => _.map(f))
}

const program = () : Fun<Sum<Array<string>, Array<number>>, Sum<Array<string>, Array<number>>> => {
	return Sum.map2(Array.map(id), Array.map(id))
}

/*
The question now is: do we really want to have a single generic function that we pass only once instead of twice to map2?
Because in order to do that, we would need to define a fun2 ((a->a1) x (b->b1)) which we can construct by duplicating 

dup(Array.map(id()))

thereby obtaining something that looks like

Sum.map2(dup(Array.map(id())))
*/

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="App">
			<div>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Rspack + React + TypeScript</h1>
			<div className="card">
				<button onClick={() => setCount(count => count + 1)}>
					Count is {count}
				</button>
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
