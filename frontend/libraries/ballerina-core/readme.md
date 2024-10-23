<img src="./Ballerina_logo-04.svg" alt="Ballerina logo" height="200" />

Welcome to _ballerina_, the effortlessly elegant functional programming framework for frontend web development, with a particular but non-exclusive preference for React.


## Quick start
Everything in Ballerina 🩰 is based on the separation of code into units called _domains_.

Create a Typescript/React project however you want (I like to use rspack but you can use whatever you prefer).

Head over to the sources, and create all the necessary files and directories for a new domain (this is just a best practice and it avoids merge conflicts in the long run):

```
mkdir helloWorld
cd helloWorld
touch state.ts
touch template.tsx
mkdir coroutines
touch coroutines/runner.ts
```

Let's define the state of our domain in `state.ts`:

```ts
import { simpleUpdater } from "ballerina-core"

export type HelloWorldContext = { greeting:string }
export type HelloWorldState = { counter:number, toggle:boolean }
export const HelloWorldState = {
  Default:() : HelloWorldState => ({
    counter:0,
    toggle:false
  }),
  Updaters:{
    ...simpleUpdater<HelloWorldState>()("counter"),
    ...simpleUpdater<HelloWorldState>()("toggle")
  }
}
```

Let's define a simple automation in `coroutine/runner.ts`:

```ts
import { CoTypedFactory, replaceWith, Unit } from "ballerina-core"
import { HelloWorldContext, HelloWorldState } from "../state"
import { Range } from "immutable"

const Co = CoTypedFactory<HelloWorldContext, HelloWorldState>()
export const helloWorldRunner =
  Co.Template<Unit>(
    Co.Repeat(
      Co.Seq([
        Co.SetState(
          HelloWorldState.Updaters.counter(replaceWith(0))
        ),
        Co.Wait(250),
        Co.For(Range(0, 3))(
          i => Co.Seq([
            Co.SetState(
              HelloWorldState.Updaters.counter(_ => _ + 1)
            ),
            Co.Wait(250)
          ])
        )
      ])
    )
  )
```

Let's put something ugly on the screen in `template.tsx`:

```tsx
import { Template, Unit } from "ballerina-core";
import { HelloWorldContext, HelloWorldState } from "./state";
import { helloWorldRunner } from "./coroutines/runner";

export const HelloWorldTemplate = 
  Template.Default<HelloWorldContext & HelloWorldState, HelloWorldState, Unit>(props => 
    <>
      <p>{props.context.greeting}</p>
      <p>Counter: {props.context.counter}</p>
      <button 
        onClick={() => props.setState(HelloWorldState.Updaters.toggle(_ => !_))}>
          Toggle {props.context.toggle ? "off" : "on"}
      </button>
    </>
  ).any([
    helloWorldRunner
  ])
```

Finally, let's render this as a top-level stateful domain from the React entry point (which file depends on the template you used):

```tsx
import { useState } from "react";
import "./App.css";
import { HelloWorldState } from "./domains/helloWorld/state";
import { HelloWorldTemplate } from "./domains/helloWorld/template";
import { unit } from "ballerina-core";

export const App = (props: {}) => {
	const [helloWorld, setHelloWorld] = useState(HelloWorldState.Default())
	return <>
		<HelloWorldTemplate 
			context={{
				greeting:"Hello!",
				...helloWorld
			}}
			setState={setHelloWorld}
			foreignMutations={unit}
			view={unit}
		/>
	</>
}
```

Head over to the page and you will see an animated `counter` value that changes on its own as well as a button you can interact with.

We have barely scratched the surface of all you can do with Ballerina 🩰 though.


If you want to know more, head over to [the official git repo](https://github.com/giuseppemag/ballerina) and check out the samples and the official documentation.
