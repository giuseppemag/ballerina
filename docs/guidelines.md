# Guidelines for writing frontend code
_by Dr. Giuseppe Maggiore_


## Special thanks
This document contains the cumulative experience acquired during two and a half decades of trying to strike the perfect balance between real-time rendering loops combined with asynchronous logic. In some sense, yes, I am the main author of this work. In a much broader sense though, no man is an island, and I am no exception.

The present work is the result of a huge amount of trust given me by people who actively used earlier versions of it (the Casanova language, widgets for React, the newer widget library, etc.) and who provided the necessary critical feedback that I required to produce the next version.

To all the people who helped me: the most heartfelt "thank you!". Together we have brought a tiny bit more order and elegance to the world of programming. I could not have done this without you, and I am looking forward to learn more from the essential critique from your brilliant minds.


## Introduction
Frontends have been growing more and more in the last decades. They started out in simple harmony with HTML and CSS for document structure and presentation, but everything changed when the Javascript nation attacked.

Moving some computation to the frontend allowed developers to write dynamic pages that can respond to the user instantaneously, without waiting for a server response. In some cases, client-side validations could even be performed fully in the frontend without having to exchange any information with the backend. A new era was dawning. 

Pioneered by applications such as Reddit and GMail, the browser started to morph into a globally available lightweight operating system capable of running whole applications. And that is where the troubles began.

Javascript and direct HTML (DOM) manipulation was nowhere near a mature-enough model to deal with large applications, complex functionality, and especially one of the nastiest, most complex domains of all: network concurrency, which means that many processes need to wait for API responses that might not even ever arrive. It was a dark time, with monstrous spaghetti-code driving developers young and old to despising despair. Hlep was needed. 

Help was on the way. Microsoft and Facebook started work on two shining projects. Typescript, and React. Typescript brought an advanced type system on top of Javascript. This type system could easily compete against type systems that we had so far only seen in the context of academic functional programming languages such as Haskell or Scala: beautiful, enticing like the song of sirens, but pitifully unusable in the context of real-world tasks. And there it was: Typescript! Capable of supporting pragmatic Javascript-style hacks when needed, but also capable of grand and beautiful type algebras to support the most advanced definitions to ensure spotless correctness in our concurrent, dynamic, API-driven frontend programs. Oh, the joy of functional programming, great types, and yet usable pragmatism for a pleasant but also practical daily life...
But no, the gifts from the realm of functional programming to the web were not exhausted! React, based on the obscure but beloved FRP (functional REACTive programming) came into play and defined a new model of declarative rendering capable of automatically updating the "scene" on the screen whenever the data that this scene depends on changes. React introduced a series of models of computation that were unheard of outside the academic world, and even more so unheard of in the world of web development. The hard split between readonly properties and a mutable state, the notion of controlled components (straight out of functional programming), the model of flawless composition: React introduced a new scale of elegance to UI development.

The early 2000s jokes about web developers not being real developers because of PHP and Javascript early poor quality all of a sudden melted like snow in the sun. Web development was now at the forefront of cutting edge knowledge on programming languages, type systems, functional programming, and more, thanks to the combination Typescript and React. Unbelievable.

Proof of this is the immense ecosystem and adoption of these tools. They quite literally took the world by storm, and raised the quality of software development overnight by a significant factor.


### And yet...
Not all that happens in the React community has been awesome though. In certain areas we have seen the community adopting messy patterns that are neither foundationally sound nor compositional. Or in some cases patterns that try to forcefully shoehorn stuff like asynchronous programming, routing, or state management into the reactive rendering model of React.

We see a lacking foundation in frameworks that promote an over-simplified way of writing stateful code: Flux is dead, Redux is dying, Zustand vs context is unclear which one shall be king of the hill, and so on.

We see a lacking foundation in frameworks that keep solving the same problem over and over again in a backwards incompatible way that forces developers to major rewrites: yes, React Router, we are looking at you.

We see a lacking foundation in frameworks that use the wrong primitives to solve complex problems in an overly simplistic way: React.Query, please enter the stage and...be ashamed.


All of these frameworks attempted to fit a square peg in a round hole, and either failed or will inevitably fail. But for some things, the answers are already known and come from the fields of software engineering and functional programming. Wielding the right techniques will allow us to write code that survives the test of time (nobody should have to rewrite a single line of code because of a new major version of React coming out) and that keeps working reliably without exploding in complexity.

Think about is: if you had written a React application all based on vanilla React with controlled components and "property drilling" (what an uglier term than _embedding_!) ten years ago, that code would still work perfectly today and also most likely in the coming decade. Think about your own impact as a developer!

In the rest of this document we will explore ways of writing code that are mathematically guaranteed to split our application into logically reusable independent units that compose without surprises out of the box, as well as withstand the test of time and allowing us to write code that works with future versions of React and also which is easy to port to React Native and even (with a bit more work of course) to other frameworks such as Vue and Angular.

Let's go!


## The main driving philosophy

The main driving philosophy of our way of working is based on _separation of concerns_. Separation of concerns aims at splitting code into different units. 
- Along the lines of methodologies such as MVC, Cleaan Architecture, etc., the units can be focused on a different _layer_ of the application (rendering, api calls, business logic, asynchronous background operations, etc.). Not everything about a given part of a program should be in the same file, and by layering out our architecture we make files a bit smaller, a bit clearer to work with, and we even make it easier to assign work to different people.
- Along the hierarchical split of different conceptual domains and their subdomains, in a hierarchy of information. Clearly splitting tables into header, filtering, and rows, and the hierarchical relationship between their states, makes is perfectly clear which components are responsible for updating which parts of which state. Debugging and maintenance become easier and more reliable. Such a split also makes it possible to identify those components that have no dependencies from the state of their parent or siblings: such domains are part of our core framework and can be moved out of the hierarchy altogether, leading to a leaner codebase where functionality stands out from tooling.


### Organizing code
Ok, enough chitchat. Let's dive into a trivial example and find out how to manage code according to powerful, universal, composable guidelines.


#### Introducing the sample domains
We want to build an application where we have four entities, organized hierarchically as follows:

```
Parent
    Child1
    Child2
Uncle
```

`Parent` and `Uncle` are the _domains_ of the application. This means that they have an own state and are independent from each other.

`Parent` is logically split into _subdomains_, `Child1` and `Child2`. `Child1` and `Child2` group together some of `Parent` functionality with the main goal of putting it into different files with clear boundaries of interaction. In a sense, `Child1` and `Child2` exist solely to make `Parent` smaller. `Child1` and `Child2` have limited access to the state of `Parent`. They may read up to all of it, but they can only write a subset of the `Parent` state.

> This is a very important point. Writing a subset of the state induces focus and simplifies debugging. Tracing changes and attributing a trail of responsibility that led to a given change in state is a fundamental activity that we make explicit in our code by splitting domains and subdomains and also by making sure that this split is clearly documented and reflected in the types. Just by inspecting the type declaration of `Child1` we can see exactly what it can read, and what it can write to.

There is one small snag in all of this. Sometimes we need to allow a component to perform a mutation in the state of a separate domain. In particular, there is one special flag inside the state of `Uncle` which we want to be able to modify from `Child2`. We will define a framework for dealing with such edge cases in a structured, well documented, clearly identifiable ways.


#### Folder structure
Each domain and subdomain has the same folder structure for ease of work and in order to promote standardization across the whole team:

```
state.ts
> coroutines
> domains
> views
template.tsx
```

The `state.ts` file contains a vanilla Typescript file (no React thus!) that defines the state of the domain.

The `coroutines` folder contains all the asynchronous business logic of the domain.

The `domains` folder contains all subdomains of the domain.

The `views` folder contains all the "dumb" presentational React components for showing the domain' state on the screen.

The `template.tsx` file is a React component that instantiates and orchestrates all these items.


#### `state.ts`

The state definition contains both the type of the state itself, as well as a _repository_ object which contains everything related to this state type: creation, updates, and processing.

This is what the outline of the `parent/state.ts` file looks like:

> `...` indicates bits of code which are omitted, we will see those later!

```ts
export type Parent = { child1: Child1; child2: Child2; counter:number; doubleCounter:number, 
	inputString:Debounced<Synchronized<Value<string>, InputStringValidation>>
};

export const Parent = {
	Default:() : Parent => ({ ... }),
	Updaters: {
	},
  Operations: {

  },
	ForeignMutations:...
};
```

You can see that a repository object contains:
- `Default`, which is a factory of the state type;
- `Updaters`, which contains all the immutable operations from the current value of the state to the next, the same signature React expects as an argument to `setState`;
- `Operations`, which contains all utilities, conversions, transformations, etc. that apply somehow to the state;
- `ForeignMutations`, which contains a subset of the `Updaters` that we want to expose to other domains (the name is pretty self-explanatory by the way).

We will now dive into each one of these.


##### Factory (`Default`)
When a domain is instantiated, the initial value of the state comes from the `Default` factory. This will initialize the whole state of the domain, including all subdomains, one by one, through their own factories:

```ts
	Default:() : Parent => ({
		child1:Child1.Default(),
		child2:Child2.Default(),
		counter:0,
		doubleCounter:0,
		inputString:Debounced.Default(Synchronized.Default(Value.Default(""))),
	}),
```

Here we see how the `counter` and `doubleCounter` are initialized with their default values, the children are initialized with their respective factories, and the `inputString`, which is an instance of two decorators inside each other, is initialized by invoking those decorators factories inside each other.

> In this example we do not accept an initial value as a factory argument but of course nothing forbids us to do so.


###### Polymorphic factories
Sometimes a domain state is polymorphic, that is it is constructed as a union of different types. In this case, the factory will also be polymorphic. Consider the very important `AsyncState<T>` which is a core domain (meaning that it is part of our core framework), which tracks the state of an asynchronous operation:

```ts
export type AsyncState<a> = (
  | ((
      | { kind: "unloaded" }
      | { kind: "loading" }
      | { kind: "reloading"; value: a }
      | { kind: "error"; value: any }
    ) & { failedLoadingAttempts: number })
  | { kind: "loaded"; value: a }
) & {
  map: <b>(f: BasicFun<a, b>) => AsyncState<b>;
  getLoadingAttempts: <a>(this: AsyncState<a>) => number;
}
```

Its factory contains one method to initialize each of the cases of the union:

```ts
  Default: {
    unloaded: <a>(): AsyncState<a> => ({
      kind: "unloaded",
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    loading: <a>(): AsyncState<a> => ({
      kind: "loading",
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    reloading: <a>(value: a): AsyncState<a> => ({
      kind: "reloading",
      value,
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    error: <a>(value?: any): AsyncState<a> => ({
      kind: "error",
      map,
      value,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    loaded: <a>(value: a): AsyncState<a> => ({
      kind: "loaded",
      value,
      map,
      getLoadingAttempts,
    }),
  },
```

Now we can initialize an async state as unloaded as follows: `AsyncState.Default.unloaded()`. 

> This is a way to remember as little different names as possible (the repository shares the name of the domain which shares the name of the type), and it also allows us to use Intellisense/autocompletion to reliably and easily explore the codebase.


##### Updaters

_Updaters_
  _Horizontal and vertical composition_
  _Core, Template, Coroutine_
_Operations_


_Templates_
  _Readonly context_
  _Writable state_
  _Layouts_
    _Dumb components_
    _Wrappers_
  _Template embedding, business logic vs visuals, dispatching subdomains_
_State management across domains_
  _useState_
  _Foreign mutations_
    _Warp gates across domains_
    _Rerendering vs dependency management of foreign mutations vs state_
_Coroutines_
  _Seq_
  _Await_
  _Any_
  _On_ vs manual implementation of events
_Api's_
  _Mocks vs regular promises_
  _Parsers_
_Core vs feature domains_
_Advanced patterns_
  _Debouncers_
  _Asynchronous validation_
  _Await with retry_
  _Infinite lists_
  _Filters_
  _The forbidden fruit is a bit less than forbidden: when does state inside components actually make sense_
