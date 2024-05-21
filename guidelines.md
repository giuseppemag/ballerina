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

Javascript and direct HTML (DOM) manipulation was nowhere near a mature-enough model to deal with large applications, complex functionality, and especially one of the nastiest, most complex domains of all: network concurrency, which means that many processes need to wait for API responses that might not even ever arrive. It was a dark time, with monstrous spaghetti-code driving developers young and old to despising despair. Help was needed. 

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
- Along the hierarchical split of different conceptual domains and their subdomains, in a hierarchy of information. Clearly splitting tables into header, filtering, and rows, and the hierarchical relationship between their states, makes it perfectly clear which components are responsible for updating which parts of which state. Debugging and maintenance become easier and more reliable. Such a split also makes it possible to identify those components that have no dependencies from the state of their parent or siblings: such domains are part of our core framework and can be moved out of the hierarchy altogether, leading to a leaner codebase where functionality stands out from tooling.


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

> We adopt the following conventions:
> - file and folder names use dashes, for example `infinite-stream-state.ts`
> - types and exported values are captialized
> - types and their operation repositories have the same name, which is the name of the domain
> - the repositories for types defined in libraries will use the suffix `Repo` in the name, for example `MapRepo`


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
The state, after having been initialized, will undergo a series of transformations depending on user input, API responses, timers, animations, etc. These transformations all have the same shape: `S => S`, that is a function from `S` (the type of the state) into `S` itself. We call this an updater, and even have a type for it: `Updater<S>`.

> Updaters are the main workhorse of our applications. Not only are they fully compatible with React, which accepts an `Updater<S>` without any conversion as an argument to `setState`: updaters also protect us from stale data when there are delays or in the presence of concurrency.
> Let's consider the dangers of the alternative, that is of passing to `setState` just the new state instead of an updater. Suppose that we have a slow promise that, when it finally completes, spreads a slightly old version of the state which was stuck in the _closure_ and passes it to `setState`: in this case, anything that happened in the meantime to the state will be **overwritten**, potentially leading to catastrophic Heisenbugs that are very difficult to diagnose and reproduce, let alone fix.

We can build an updater by wrapping it around the `Updater` constructor:

```ts
const incr = Updater<number>(_ => _ + 1)
const decr = Updater<number>(_ => _ + 1)
```

The `Updater` constructor takes a lambda expression and adds some utilities to it, while retaining a callable lambda for convenience. We can thus do the following:

```ts
console.log(incr(10))
```

with the expected result.


###### Composition
Updaters feature a very powerful model of composition. The most basic form of composition is that they allow us to build pipelines that represent multiple update steps in one. 

The most important utility that we get from `Updater` though, is `then`. `then` allows us the _horizontal_ composition of two updaters that operate on the same state:

```ts
const incr2:Updater<number> = incr.then(incr)
```

`incr2` is just an updater that can be used like any other updater, even though it is implemented as a pipeline with multiple steps. 

> Also, note that type inference works out of the box, so we don't need to specify the type of `incr2` explicitly. The snippet before includes the type annotation just for illustration purposes.


The most advanced form of composition allows us to transform an updater of a child into an updater of a parent. Bear with me, this will take a moment to explain but it makes life a lot easier so it's definitely worth it!

Let's start by extending the `Child1` domain with some updaters:

```ts
export type Child1 = { x: number; y: string; };
export const Child1 = {
	Default:() : Child1 => ({
		x:0,
		y:"",
	}),
	Updaters: {
		Core: {
			...simpleUpdater<Child1>()("x"),
			...simpleUpdater<Child1>()("y"),
		}
	}
}
```

The updaters are only marked as `Core`, meaning that they are meant for general usage. We can further organize `Updaters` into `Template` and `Coroutine`, depending on what they are meant to do: `Template` updaters are connected directly to end-user interactions, whereas `Coroutine` updaters are connected to coroutines, which are automated background processes related to APIs and such.

`...simpleUpdater<Child1>()("x")` is exactly the same as the following:

```ts
{ x: (xUpdater:BaseUpdater<Child1["x"]>) : Updater<Child1> => Updater((child1:Child1) : Child1 => ({...child1, x:xUpdater(child1.x)}) }
```

> `BaseUpdater` has the same callable signature of a normal updater but it does not need to be created with a wrapping `Updater(...)` for convenience.

Given the frequency by which we use this pattern, it's handy to have a utility such as `simpleUpdater` that automates most of this tedious work.

Let's dive quickly into this pattern because we will follow it at all levels. Each updater inside a repository will take as input an updater of the field, in our case `Updater<Child1["x"]> == Updater<number>`, and return an updater of the whole state, in our case `Updater<Child1>`.

We can define a change to `Child1` that increments its `x` field as follows:

```ts
Child1.Updaters.Core.x(_ => _ + 1)
```

We can compose such updaters horizontally:

```ts
Child1.Updaters.Core.x(_ => _ + 1).then(Child1.Updaters.Core.x(_ => _ * 2))
```

And nothing stops us of course from updating more than one field at the same time:

```ts
Child1.Updaters.Core.x(_ => _ + 1).then(Child1.Updaters.Core.x(_ => _ * 2)).then(Child1.Updaters.Core.y(_ => _ + "!"))
```

> **PROTIP**: indentation becomes a more and more important friend to navigate such long chains.

And what if we just want to replace the value of `y` with, say, `"abc"`? Look no further! Just use `replaceWith`:

```ts
Child1.Updaters.Core.x(_ => _ + 1).then(Child1.Updaters.Core.x(_ => _ * 2)).then(Child1.Updaters.Core.y(replaceWith("")))
```


Let's crank this up a notch by looking at what happens between `Child1` and its `Parent`, because this is where the plot thickens!

The parent has the following core updaters:

```ts
	...simpleUpdater<Parent>()("child1"),
	...simpleUpdater<Parent>()("child2"),
	...simpleUpdater<Parent>()("counter"),
	...simpleUpdater<Parent>()("doubleCounter"),
	...simpleUpdater<Parent>()("inputString"),
```

How do we update the field `x` of `child1` inside the parent? Easy peasy!

```ts
Parent.Updaters.Core.child1(Child1.Updaters.Core.x(...))
```

This is what we call a _vertical_ composition, because it (re-) composes update operations along the vertical direction of the hierarchical decomposition of our states. BAM!

The coolest thing though is that we can compose both horizontal and vertical compositions:

```ts
Parent.Updaters.Core.child1(
  Child1.Updaters.Core.x(...)
).then(
  Parent.Updaters.Core.child2(
    Child2.Updaters.Core.a(...)
  ).then(
    Parent.Updaters.Core.counter(
      ...
    )
  )
)
```

There is no limit but the business requirements of the application (as well as a pinch of common sense).

> When do you know that a given abstraction is powerful? When it can be composed freely. Composability means that a given entity is defined in tune with the algebraic/mathematical substrate, which is the same as saying that a building is constructed well within the boundaries of the laws of physics: a good guarantee of success and high quality.


##### Operations
Updaters have a very clear structure and composition. Sometimes though, we just need plain old utility operations in a given domain. Counting, finding, extracting: these are all operations that tend to have signatures like: `(S, input) => output`, that is "take as input the state `S`, some extra `input`, and produce an `output` which is not related to `S`".

We group them under `Operations` in the repository. For example, the debouncer domain has a utility operation that checks if there is background work to do or not: 

```ts
	Operations:{
		shouldCoroutineRun:<v>(_:Debounced<v>) => _.dirty != "not dirty"
	}
```

Operations are the least structured and most free of all of our components. Ideally, we don't want too many operations, but of course some domains have more complex data structures that need a lot of supporting operations: there are no strict rules on this topic.


##### Foreign mutations
Some updaters need to be exposed as simple callbacks for other domains to invoke. For example, imagine an authentication domain which wants to expose a `logoutNow` callback for other domains to invoke wherever they want. We group such callbacks into a `ForeignMutations` object which can be passed around as a controlled, well-understood proxy to the state setter for the domain. Consider the `Uncle` domain which exposes a `flag` that can be mutated from outside the domain:


```ts
export type Uncle = {
  flag:boolean
}

export const Uncle = {
  Default:() : Uncle => ({
    flag:false
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<Uncle>()("flag")
    }
  },
  ForeignMutations:(_:ForeignMutationsInput<UncleReadonlyContext, UncleWritableState>) => ({
    setFlag:(newValue:boolean) =>
      _.setState(Uncle.Updaters.Core.flag(replaceWith(newValue)))
  })
}
```

The `foreignMutations` should really only use updaters, because the business logic is fully implemented in the updaters and the foreign mutations just _expose_ a subset of this business logic, but do not define new business logic.

For each domain, we define two types: the foreign mutations _exposed_ by this domain, which can be invoked by other domains in order to modify the local state, and the foreign mutations expected that the local domain needs in order to propagate its signals to the others.

For example, the `Uncle` domain expects no foreign mutations, so it uses the `Unit = {}` empty type, but it exposes the return type of its `Uncle.ForeignMutations` factory as the foreign mutations that others can invoke in order to modify its own state:

```ts
export type UncleForeignMutationsExpected = Unit
export type UncleForeignMutationsExposed = ReturnType<typeof Uncle.ForeignMutations>
```

On the other hand, the `Child2` (sub-) domain expects some foreign mutations, but what it exposes is really just the `Unit` type:

```ts
export const Child2 = {
	...
	ForeignMutations:(_:ForeignMutationsInput<Child2ReadonlyContext, Child2WritableState>) => ({})
};

export type Child2ForeignMutationsExpected = { setFlag:SimpleCallback<boolean> }
export type Child2ForeignMutationsExposed = ReturnType<typeof Child2.ForeignMutations>
```

> We should not write `export type Child2ForeignMutationsExposed = Unit` because as the application grows in size, the chance that we will need to add foreign mutations exposed over the course of time is a virtual certainty, so better make room for extension from the start. This might be annoying to do manually, but given that domains can be created with a command line utility that sets everything up for us, including the foreign mutations expected and exposed, the annoyance is much smaller in practice.

Whenever we are dealing with a hierarchical decomposition, such as that of `Parent` and `Child1`/`Child2`, we need to remember that the foreign mutations bubble up. This means that the parent expects _at least_ the foreign mutations of all of its children:

```ts
export type ParentForeignMutationsExpected = Child1ForeignMutationsExpected & Child2ForeignMutationsExpected
```

Where we instantiate the domains, we need to provide the `ParentTemplate` with its foreign mutations expected. It might very well be that we do not have a perfect match between foreign mutations, so we create a little _adapter_ on the fly that converts the available domains and their foreign mutations exposed into the various methods of the foreign mutations expected:

```tsx
<ParentTemplate
	context={parent}
	setState={setParent}
	foreignMutations={{
		setFlag: uncleForeignMutations.overrideFlag
	}}
/>
```

> It is very important to realize that domains need to be self contained, and that they should mention other domains outside of the same hierarchy **as little as possible**. It is much better for `Child2` to define its requirements independently of `Uncle`, because this promotes separation of concerns between domains. Of course sometimes this can become very impractical: an `AuthState` and its foreign mutations will probably be passed along everywhere as is, so the rule is: _a universal concern may be passed directly_, a _local one must be redefined in the consumer domain and adapted at the template instantiation_.


##### Readonly context and writable state
The very last thing we define in a `state.ts` file are the readonly context and the writable state of the domain. The writable state is always the type of the state. This is just a disambiguation/hint for other developers, but there's nothing special here. Our domain will be able to read _and_ write this state.

The readonly context on the other hand can be read, but cannot be written through updaters. For some domains with no dependencies this might be `Unit` (recall that `type Unit = {}`). For some subdomains it might be a slice of the domain states of the ancestors. For some domains it might be the state of other domains (it's always safe to read the state of other domains of course). Any combinations are allowed and also encountered in practice. 

For the `Parent` domain, we get:

```ts
export type ParentReadonlyContext = Unit
export type ParentWritableState = Parent
```


##### `.ts` vs `.tsx` files: why do we even care?
We should now spend a moment emphasizing something of great importance for the long term impact of our code. Everything we have seen so far is contained in the `state.ts` file. This means that a huge part of our code has been extracted away from React.

This has some huge consequences. First of all, we can reuse this code outside of React. For example, with React Native. We keep business logic safe and sound away from rendering. And also, updates and upgrades to React will have no impact whatsoever on the correctness of our state files.

Even in the extreme scenario of React disappearing overnight from the face of the Earth, our state files would allow us to quickly migrate to a new framework with relatively little pain.

In short, disentangling our business logic from React makes our work more impactful and on a longer time scale.


#### Coroutines
Modern single page applications feature a lot of asynchronous logic that can be very complicated to model. If we are not armed with the proper tools, we will either face great complexity, lots of bugs, or a depressing combination of the two. But no worries: we are not in a Russian novel from the late '800s, meaning that a happy ending is not only possible, but quite probable. Read on!

In order to capture all of the asynchronous logic of our domains we use coroutines. Coroutines are a cousin of `Promise` which allows suspending a computation for either one "tick", or even a given amount of time.

Coroutines are initialized by first creating the coroutines builder itself:

```ts
export const Co = CoTypedFactory<ParentReadonlyContext, ParentWritableState>()
```

We do this to avoid specifying the type arguments of the domain for each statement of the coroutine. The arguments are, in order:
- the readonly context of the domain, which the coroutine may read;
- the writable state of the domain, which the coroutine may read and write.

We then use this builder to define the coroutine itself. For example, we could define an infinite loop which invokes the tick updater every 2.5s:

```ts
export const autoTickCounter = 
  Co.Repeat(
    Co.Seq([
      Co.SetState(Parent.Updaters.Coroutine.tick()),
      Co.Wait(2500)
    ])
  )
```

- `Co.Repeat` takes as input a coroutine and runs it once, then repeats, forever;
- `Co.Seq` takes as input an array of coroutines and runs them in sequence, one after the next;
- `Co.SetState` takes as input a state updater (usually either from `Core` or `Coroutine`, and not from `Template`) and applies it;
- `Co.Wait` takes as input a number in ms and pauses the coroutine for that amount of time.

We can run a coroutine by wrapping it in a runner object with `Co.Template`, which needs to know which foreign mutations the domain uses in order to instantiate a React component with the right type (more on this in the chapter on templates):

```ts
export const ParentCoroutinesRunner =
  Co.Template<ParentForeignMutationsExpected>(
    autoTickCounter,
  )
```

The runner created with `Co.Template` is just a regular React component with a few extra tricks up its sleeve, a bit like `Updater` is just a regular callable function with some nice extras like `.then`. This means that we can just use it as we would any other React component:

```tsx
<ParentCoroutinesRunner context={...} setState={...} foreignMutations={...} />
```

> Given that `context`, `setState`, and `foreignMutations` are often implied by the domain in which we are operating, there are a few shorthands that make instantiating such a React component more automated. Up to you if you like this sort of thing or not, o noble reader!


Coroutine can be defined inside subdomains. For example, the `Child2` subdomain also has an animation that increments the values automatically in a `Co.For` asynchronous loop that takes a few steps, and then the whole process is reset and starts all over again:

```ts
export const Child2Animation = 
  Co.Repeat(
    Co.Seq([
      Co.SetState(Child2.Updaters.Core.a(replaceWith(1)).then(Child2.Updaters.Core.b(replaceWith("")))),
      Co.For(Range(0, 3))(
        _ =>
          Co.Seq([
            Co.Wait(250),
            Co.SetState(Child2.Updaters.Core.a(_ => _ * 2)),
            Co.Wait(250),
            Co.SetState(Child2.Updaters.Core.b(_ => _ + ".")),
          ])
      ),
      Co.Wait(250),
    ])
  )
```

> I cannot possibly understate how easy and pretty this code look, especially when compared with the absurdly overcomplicated alternative of emulating the same logic implicitly throughout callbacks, promises, or state changes in React. I just cannot. PLEASE FEEEEEEEEEEEEEEELLLLLLLLLLLLL THIS ❤️❤️❤️❤️


##### Advanced usage of coroutines: an asynchronous debouncer
Let's now (not so) quickly do a deep dive into a feature that is very complex to build manually, and where coroutines help a lot.

> I love to remind to myself, and occasionally others, that the solution to a given problem will never be simpler than the _intrinsic complexity_ of the problem. The amount and shape of information to process and transform will be reflected by a solution of equivalent or higher weight; the trick is to avoid the extra ballast, such as pointer arithmetics in the languages of old, which do not help with the solution and actually just add _spurious complexity_. 
> Yes, we need to peacefully deal with the fact that there is no free lunch, and there is no magic bullet, which on one hand is discouraging, but on the other hand it is something that elevates the value of our practice to something amazing and fundamental and irreplaceable.

We will build a generic, reusable debouncer which is capable of running an asynchronous operation with customizable retries for validation or synchronization.


###### `Synchronized` domain decorator
We start with a synchronizer, a wrapper around a domain or subdomain data which adds logic to perform an API call with retries in order to synchronize.

The synchronizer is a _generic_, _core_ domain. 

It is a core domain because it depends on nothing but other core domains, and as such it is not tied into any of the data of our application. It could, in principle, be used in a completely different React application without hassle.

It is a generic domain because it accepts a type parameter which is meant to be a domain or subdomain state to be decorated with extra synchronization information and updaters.

The state is defined by extending the subdomain state `v` (stands for "value") with an `AsyncState<s>` (tracking the status of the asynchronous operation: `unloaded -> loading -> error | loaded -> reloading`) that will try to obtain the synchronization data `s` through some asynchronous call such as a `Promise`:

```ts
export type Synchronized<v, s> = v & { sync: AsyncState<s>; };
```

> We extend `v` instead of adding a `value:v` inside the `Synchronized` because, well, we can, and because it looks very cool. This way, adding even multiple decorators will not result in a long chain of `.value.value.value...` which, frankly, looks hideous. It comes with a couple of extra hurdles though, which we will overcome in a second. Ahhh, the things we do for beauty in code...

The synchronized repository fires up a `Default` value where the asynchronous status is unloaded, and then providing us with two updaters: one for the `sync` status, and the other for the `value`:

```ts
export const Synchronized = {
	Default: <v, s>(initialValue: v): Synchronized<v, s> => ({
		...initialValue,
		sync: AsyncState.Default.unloaded()
	}),
	Updaters: {
		sync: <v, s>(_: BasicUpdater<AsyncState<s>>): Updater<Synchronized<v, s>> => Updater<Synchronized<v, s>>(current => ({
			...current,
			sync:_(current.sync),
		})),
		value: <v, s>(_: BasicUpdater<v>): Updater<Synchronized<v, s>> => Updater<Synchronized<v, s>>(current => ({
			...current,
			...(_(current))
		})),
	}
};
```

Unfortunately, the `sync` and `value` updaters need to be built manually here. On one hand, the generic arguments do not work well with `simpleUpdater`; on the other hand, we always need to spread `current` in order to satisfy the type constraints of the `&` operator.

> The `simpleUpdater`, as the name suggests, works well for simple scenarios, but in the core domains we might often see that it does not do the trick becaue we are using more advanced coding patterns. "Simple" indeed.

And there we go! We can now define the synchronization coroutine. The coroutine needs two inputs, `p`, which is a function that takes as input the current value `v` and synchronizes it with a promise that returns a `syncResult` (or a permanent/temporary error to guide the retry mechanism), whatever the value and the synchronization result may be. The coroutine that is returned operates on:
- a readonly context which is the state of the synchronized wrapper domain, `Synchronized<v, syncResult>`;
- a writable state which is, again, the state of the synchronized wrapper domain, `Synchronized<v, syncResult>`;
- finally, after having produced a series of state updaters over the state of the domain, we get one last completion result of type `ApiResultStatus`.

> Coroutines have two ways to exchange data with their context (read two sorts of "outputs"). A possibly infinite stream of state updates, followed by, eventually, a final result.

```ts
export const Synchronize = <v, syncResult, event extends { Kind: string; }>(
	p: BasicFun<v, Promise<syncResult>>, errorProcessor: BasicFun<any, ErrorPermanence>,
	maxAttempts: number, delayBetweenAttemptsInMs: number):
	Coroutine<Synchronized<v, syncResult>, Synchronized<v, syncResult>, event, ApiResultStatus> => {
	const Co = CoTypedFactory<Unit, Synchronized<v, syncResult>, event>();
	return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoading())).then(() =>
		Co.GetState().then(current =>
			Co.Await(() => p(current as v), errorProcessor).then(apiResult =>
				(apiResult.kind == "l") ?
					Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => Co.Return<ApiResultStatus>("success"))
					: (apiResult.value == "transient" && maxAttempts > 0) ?
						Co.Wait(delayBetweenAttemptsInMs).then(() => Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs))
						:
						Co.Return<ApiResultStatus>("permanent failure")
			)
		)
	)
};
```

Let's x-ray this thing line by line. First we declare the builder, which needs to be defined inside the coroutine because it depends on the generic arguments:

```ts
const Co = CoTypedFactory<Unit, Synchronized<v, syncResult>, event>();
```

Then we mark the sync part of the state as loading. We then proceed with the rest. Given that we want to return the result of the subsequent coroutine inside the `.then` block, we cannot use `Co.Seq` which does not allow a result other than `Unit`:

```ts
return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoading())).then(() =>
```

We then read the current state:

```ts
Co.GetState().then(current =>
```

We run the `Promise` with the current value. It's important that the value comes from the state we just read, otherwise we risk trying to synchronize a stale/old state:

```ts
Co.Await(() => p(current as v), errorProcessor).then(apiResult =>
```

When the `apiResult` indicates success, we mark the `sync` to loaded and then return a success as a final value:

```ts
(apiResult.kind == "l") ?
  Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => 
    Co.Return<ApiResultStatus>("success"))
```

In case of failure, we have two scenarios. Either we encountered a transient error (something that requires a retry, such as for example a timeout), _and_ we have not exhausted the maximum number of allotted attempts, then we try again but with one less attempt allowed and after waiting a bit to avoid flooding the network with calls:

```ts
: (apiResult.value == "transient" && maxAttempts > 0) ?
  Co.Wait(delayBetweenAttemptsInMs).then(() => Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs))
```

> The recursive call shows a little pearl of a pattern. Instead of adding the `maxAttempts` to the state, which would be irrelevant to any other business logic within our domain, we keep it in the closure and we use recursion as a way to reassign it.
> This advanced pattern can be used in many places in order to have local mutable state without, well, local mutable state (this sentence is partially a joke, but partially not: working with pure functions that are referentially transparent guarantees properties of composition that actually make it much easier to reason about code and to ensure correctness).

Finally, if we encountered a permanent error or we ran out of attempts, we return a permanent failure:

```ts
: Co.Return<ApiResultStatus>("permanent failure")
```


###### `Debounced` domain decorator
The next decorator we define is the debounced, which inhibits a coroutine from running only when the underlying state has changed long enough ago.

Debounced is a generic core domain used around another domain state, the `Value`, which gets augmented with a `dirty` flag to track if the value has been modified since the last operation, and the `lastUpdated` timestamp which tracks when the last update happened:

```ts
export type DirtyStatus = "dirty" | "not dirty" | "dirty but being processed"
export type DebouncedStatus = "waiting for dirty" | "just detected dirty, starting processing" 
	| "processing finished" | "state was still dirty but being processed, resetting to not dirty"
	| "state was changed underwater back to dirty, leaving the dirty flag alone"
	| "inner call failed with transient failure"
export type Debounced<Value> = Value & { lastUpdated: number; dirty: DirtyStatus; status:DebouncedStatus };
```

> `DirtyStatus` is not just a boolean, because we need to track the intermediate status of the value being dirty while being processesed.

> We also track the global status, which is very useful for tracing and debugging. Not much debugging of the debounced domain itself will be needed, but sometimes understanding why something is not behaving as expected can be simplified by such tracing aids. Feel free to delete it if you or the team at some point concludes that it never gets used.

The repository contains the usual factory and some pretty standard-looking core updaters, but it also contains one template updater which not only changes the underlying value, whatever it may be: it also marks the change by setting `dirty` and `lastUpdated`:

```ts
export const Debounced = {
	Default: <v>(initialValue: v): Debounced<v> => ({
		...initialValue,
		lastUpdated: 0,
		dirty: "not dirty",
		status: "waiting for dirty"
	}),
	Updaters: {
		Core:{
			status: <v>(_: BasicUpdater<DebouncedStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				status: _(current.status),
			})),
			dirty: <v>(_: BasicUpdater<DirtyStatus>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				dirty: _(current.dirty),
			})),
			lastUpdated: <v>(_: BasicUpdater<number>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...current,
				lastUpdated: _(current.lastUpdated),
			})),
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...(_(current)),
				dirty: current.dirty,
				lastUpdated: current.lastUpdated,
				status: current.status
			})),
		},
		Template:{
			value: <v>(_: BasicUpdater<v>): Updater<Debounced<v>> => Updater<Debounced<v>>(current => ({
				...(_(current)),
				dirty: "dirty",
				lastUpdated: Date.now(),
				status: current.status
			}))
		}
	},
	Operations:{
		shouldCoroutineRun:<v>(_:Debounced<v>) => _.dirty != "not dirty"
	}
};
```

> The `Template` updater is called as such because it will be invoked by the React component that responds to user input events. This component is known as a _template_. We will dive deep into this later.

> There's also an `Operation`, `shouldCoroutineRun`. When `dirty == "not dirty"`, there is no reason for the coroutine to be running at all, so we can short-circuit the whole thing for performance reasons, in order to avoid a wasteful busy loop. The fastest instruction to run is the one you don't run!

TIME FOR THE MAIN DISH! The coroutine itself! 

> This is quite a substantial beast, but rejoice: the ability to capture such a little monster in a generic function means that, yes, it is a terrible monster, but also yes, we have tamed it and it's now a useful pet that can, I dunno, protect the crops from crows, thieves, and even evil wizards and witches when the need arises.

Let's take a look at the code in its entirety, and then dissect it line by line:

```ts
export const Debounce = <v, e extends { Kind: string; }>(
  k: Coroutine<v, v, e, ApiResultStatus>, debounceDurationInMs: number, waitBeforeRetryOnTransientFailure: number = debounceDurationInMs * 2) => {
	const Co = CoTypedFactory<Unit, Debounced<v>, e>();
	const updaters = Debounced.Updaters;
	return Co.Seq([
		Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("waiting for dirty"))),
		Co.While(([current]) => current.dirty != "dirty" || Date.now() - current.lastUpdated <= debounceDurationInMs,
			Co.Wait(debounceDurationInMs / 5)
		),
		Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty but being processed"))),
		Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("just detected dirty, starting processing"))),
		k.embed((_: Debounced<v>) => _, updaters.Core.value).then(apiResult => {
			return Co.Seq([
				Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("processing finished"))),
			]).then(() => {
				return Co.GetState().then(current => {
					if (apiResult == "success" || apiResult == "permanent failure") {
						if (current.dirty == "dirty but being processed") {
							return Co.Seq([
								Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("state was still dirty but being processed, resetting to not dirty"))),
								Co.UpdateState(state => 
									state.dirty == "dirty but being processed" ?
										updaters.Core.dirty(replaceWith<DirtyStatus>("not dirty"))
									: updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
							])
						} else {
							return Co.Seq([
								Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("state was changed underwater back to dirty, leaving the dirty flag alone"))),
								Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
							])
						}
					} else {
						return Co.Seq([
							Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("inner call failed with transient failure"))),
							Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
							Co.Wait(waitBeforeRetryOnTransientFailure)
						]);
					}
				})
			})
		})
	]);
};
```

First of all, the input parameters are the inner coroutine that will be debounced, which operates on the inner state `v`, the amount of time required for the debounce, and how long do we wait before retrying when we encounter a transient failure from the inner coroutine:

```ts
k: Coroutine<v, v, e, ApiResultStatus>, debounceDurationInMs: number, waitBeforeRetryOnTransientFailure: number = debounceDurationInMs * 2
```

We then initialize the builder and even define a shortcut for the updaters (why not? We are not Soviet Union workers paid no matter what, so we might optimize every keystroke!):

```ts
const Co = CoTypedFactory<Unit, Debounced<v>, e>();
const updaters = Debounced.Updaters;
```

Inside a `Co.Seq` we do a bunch of things in linear sequence. We start by marking the trace status to waiting for dirty, which is a bit of a misnomer because we wait for both dirty _and_ the timer, but let's not split hair here:

```ts
Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("waiting for dirty"))),
```

Then we actually wait with an asynchonous `while` loop:

```ts
Co.While(([current]) => current.dirty != "dirty" || Date.now() - current.lastUpdated <= debounceDurationInMs,
	Co.Wait(debounceDurationInMs / 5)
)
```

> The input to `While` are a condition, dependent on the current context and state, so that we can check that the state reaches the desired condition for continuation, as well as a coroutine to run while the condition remains true. It is a very good practice to wait before the next iteration. In our case, we only wait inside the body of the loop.

> It's hard to impress how magnificent this piece of code is. Build this loop without coroutines. Go on, I dare you! I double dare you, XXX! (XXX = what would Samuel Jackson say?).

Now we mark the state to `dirty but being processed`. We track that the value is still dirty, but we will also be able to see that a new change has occurred in case `dirty` goes back to `"dirty"`, and in this case we know that even though processing might have completed successfully, we need to start over again because a new change happened that needs to be processed again:

```ts
Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty but being processed"))),
```

We also mark in our trace that processing is starting:

```ts
Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("just detected dirty, starting processing"))),
```

Ok, now things get _really intriguing_. Remember `k`, the inner coroutine that operates on `v` as a state? Well, we cannot just invoke it like this because the state of the debouncer is different, but we can _embed_ it by providing a narrowing transformation of the debounced state down to `v` (very easy, because `v` is just an extension of `Debounced<v>` so the structural type system appreciates that we can directly convert `Debounced<v>` to `v`) and we also need to convert the state update calls that `k` produces, which will have type `Updater<v>`, to update calls that the debouncer can work with, which need to have type `Updater<Debounced<v>>` (also very easy, because that is exactly what the `Core.value` updater does for us):

```ts
k.embed((_: Debounced<v>) => _, updaters.Core.value).then(apiResult => {
```

> We kind of assume that this is an API call, hence the name of the result variable `apiResult`, but this is not strictly needed. All sorts of client-side processing or transformations could fit inside `k`, and debouncing those just makes for a better and more fluid UX.

We continue with yet another trace update, because we want to track that the processing has finished, with some result or error:

```ts
Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("processing finished")))
```

Now, we need to cross-reference the result of `k`, which might be of a definitive nature (either success or permanent failure), and the latest dirty status, which should still be `"dirty but being processed"`:

```ts
return Co.GetState().then(current => {
	if (apiResult == "success" || apiResult == "permanent failure") {
		if (current.dirty == "dirty but being processed") {			
```

If this was the case, we update the trace, and then we reset the dirty status to `"not dirty"`, but we do it with an atomic `UpdateState` operation that checks until the last iteration to make sure that the state has not just changed, because in that case we go back to `"dirty"` because the last change happened _after_ the work done by `k`:

```ts
			Co.Seq([
				Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("state was still dirty but being processed, resetting to not dirty"))),
				// use UpdateState to make sure that we look up the state at the last possible moment to account for delays
				Co.UpdateState(state => 
					state.dirty == "dirty but being processed" ?
						updaters.Core.dirty(replaceWith<DirtyStatus>("not dirty"))
					: updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
			])
```

In case of the dirty state being changed underwater, we update the trace and set the state back to `"dirty"`:

```ts
		} else {
			return Co.Seq([
				Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("state was changed underwater back to dirty, leaving the dirty flag alone"))),
				Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
				// Co.Wait(250)
			])
		}
```

In case of a transient failure, we update the trace, keep dirty as `"dirty"`, and wait a bit before retrying, because hopefully giving it a bit of time will allow us to succeed later, for example when having a poor connection while driving through a tunnel:

```ts
	} else {
		return Co.Seq([
			Co.SetState(updaters.Core.status(replaceWith<DebouncedStatus>("inner call failed with transient failure"))),
			Co.SetState(updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))),
			Co.Wait(waitBeforeRetryOnTransientFailure)
		]);
	}
```

> We might use the concurrent operator `Co.Any`, which runs two coroutines in a race that will terminate as soon as any of them is completed, to shortcut `k` if it takes too long to process and/or `dirty` has switched back. Something like this:
> ```ts
> Co.Any([
> 	k.embed(...),
> 	Co.While(([current]) => current.dirty != "dirty" || Date.now() - current.lastUpdated <= debounceDurationInMs,
> 		Co.Wait(debounceDurationInMs / 5)
> 	),
> ])
> ```
>
> would effectively only allow `k` to run while dirty is not reset, because in that case the old execution of `k` is processing stale data and so we might want to restart the coroutine. Be careful though! This optimization might have the side effect that in case of a slow network, we might make things even worse by firing up many calls to `k` in a relatively short sequence, and if those leave a `Promise` hanging, this might consume too many network resources. It is an easy change, but it needs a conscious evaluation of the tradeoffs.


###### Bringing it all together
Finally, we can use the debounced synchronizer quite easily in the parent. Let's see how! First we add a text field, `inputString`, to the `Parent` state. The text field is a `Value<string> = { value:string }` (this is needed to avoid overwriting methods of the `string`, which leads to weird unintended consequences: this single level of indirection is unavoidable). We wrap it first in a `Synchronized` container, because we want all changes to the text to be synchronized with an asynchronous call, but we further wrap in a `Debounced` because we don't want the synchronization to run all the time at every keystroke, but only after the user has stopped typing for a long-enough fraction of a second that we may optimistically assume they might be done and thus either validate or submit the data:

```ts
export type Parent = { child1: Child1; child2: Child2; counter:number; doubleCounter:number, 
	inputString:Debounced<Synchronized<Value<string>, InputStringValidation>>
};
```

All updaters related to input events are grouped under `Template`, and the one for `inputString` is no exception:

```ts
Template:{
	inputString:(_:Updater<string>) => 
			CoreUpdaters.inputString(
				Debounced.Updaters.Template.value(
					Synchronized.Updaters.value(
						Value.Updaters.value(
							_
						)
					)
				)
			),
```

Notice though that the argument to `inputUpdater` operates on a single string, because we don't want the frontend React components to bother with the debouncer and synchronizer decorators while dealing with updates to the text.

When rendering, we pass the string along simply as `inputString.value` and directly invoke the `Template.inputString` updater with the new text value:

```tsx
<ParentInputs
	inputString={props.context.inputString.value}
	onChangeInputString={_ => props.setState(Parent.Updaters.Template.inputString(replaceWith(_)))}
/>
```

We are almost done! We only need to define the coroutine for the parent, which simply invokes `Debounce` with `Synchronize` as an argument:

```ts
Co.Repeat(
	(Debounce<Synchronized<Value<string>, InputStringValidation>>(
		Synchronize<Value<string>, InputStringValidation>(ParentApi.validateInputString,
			(_: any) => _ in apiResultStatuses ? _ : "permanent failure", 5, 150),
		250, 500)
			.embed(parent => parent.inputString, Parent.Updaters.Core.inputString))
	);
```

Notice two peculiarities. First of all, we run this coroutine forever thanks to `Co.Repeat`, because we are never really done debouncing because there might always be a new input. Also, the `Debounce` coroutine is _embedded_ because it operates on the `inputString`, but we want to use this coroutine in the context of the `Parent` state, so we need the narrowing operator from `parent => parent.inputString`, and we need to widen the updaters of `inputString` into the parent state with `Parent.Updaters.Core.inputString`. This effectively translates the debounced coroutine so that it can be seamlessly combined together with coroutines defined on the parent domain.

> Embedding is a fundamental operator when dealing with any form of software engineering. We want to define isolated, generic, reusable units across our code, because without such units we will end up with either a lot of repetition or leaky abstractions. Using such reusable units though requires plugging them into the domain into which they are supposed to operate, and this requires narrowing, because the domain state is always larger than the domain of the reusable unit, but the mutation signals from the reusable units then need to be widened back into the larger domain. Narrowing and widening together form an embedding.

Finally, we can run the debounce coroutine. We could run it directly with `Co.Template`, which takes as input a coroutine and gives us a React element that we can render with the normal `<.../>` syntax, but in this case we add an extra parameter to prevent instantiating the coroutine when not needed, because we want to dismount it from the scene in case `shouldCoroutineRun` is set to false, so that when there are no input changes we do not run the `Co.While` of the coroutine for no reason, pointlessly burning CPU cycles (especially if a lot of debouncers are active on the screen):

```ts
export const ParentDebouncerRunner = 
  Co.Template(
    debouncedInputSynchronizer,
    { runFilter:props => Debounced.Operations.shouldCoroutineRun(props.context.inputString) }
  )
```

The `ParentDebouncerRunner` can be instantiated as a regular React component. More on instantiating components in the chapter about _templates_.


#### APIs
A bit of a relaxing, light topic: APIs. We group APIs in their own `apis` folder in the respective domain. For example, the parent domain only has one API, the one responsible for validating the input:

```ts
export const ParentApi = {
  validateInputString: (_: Value<string>): Promise<InputStringValidation> => 
		new Promise<InputStringValidation>((resolve, reject) => 
			setTimeout(() => Math.random() > 0.2 ? resolve("valid") : reject(apiResultStatuses[2])))
};
```

We switch the whole API repository object between one containing mocks, and one containing the actual API calls. **It is extremely important to keep in mind that mocks are a fundamental aspect of our way of working**. We want to exhibit exaggerate faulty behaviours and delays in order to ensure that the application handles these edge cases gracefully, so that we are not lulled into a false sense of security by the speed and reliability of our development machines.

When parsing and validation of API responses is needed (often thus), we separate the raw API calls from the parsers, validators, and converters. The repository pattern is the usual, and we just use the `.then` operator after the `Promise` performing the API call in order to post-process its result.

> Generating a mocked promise manually is a tedious process. If you don't want to write such boilerplate over and over again, feel free to use the `PromiseRepo.Default.mock` constructor which creates a synthethic `Promise` with randomized exponential waiting time, customizable fail rates, etc.
> The `ParentApi` can be simplified with this reusable domain as follows:
> `PromiseRepo.Default.mock<Validation>(() => "valid", () => apiResultStatuses[2], 0.8, 0.2)`
> denoting that we want to simulate an API call with an average delay of 0.2s (and exponential distribution), with 80% success rates, and the success and error callbacks producing the outputs of the call.

#### Templates
As mentioned before, all the files we have written so far are `.ts` files built in vanilla Typescript with minimal dependencies. This is very important and can hardly be understated: writing vanilla files makes debugging a reliable and self-contained investigation (rather than desperately scouring the web for error messages from a weird library); it separate the business logic and business object definitions from the rendering logic of React and other packages; it makes usage of React.Native or even outright different libraries for native or server-side rendering based on the same underlying business logic. Also, disentangling business logic and rendering minimizes merge conflicts, and promotes working in parallel on the same codebase, and even on the same domain by different specialists.

The _template_ within a domain is responsible for connecting the vanilla Typescript world to the world of React. The React components are as stateless as possible, meaning that they can have an internal state that is exclusively related to rendering properties such as scrolling, hovering, purely visual animations, etc. The React components are also as independent as possible from the state definitions of the domain they are built for: this promotes a separate hierarchy of reuse of the rendering components, when possible and practical.

For example, the parent domain features a couple of buttons for implementing counters, as well as an input box for rendering and modifying text. Ideally, this is implemented as a controlled component without any references to the parent domain itself, or the state, with just simple data inputs and callbacks, as follows:

```tsx
import { SimpleCallback } from "ballerina-core"

export const ParentInputs = (props:{
  counter:number,
  onIncrement:SimpleCallback,
  onDoubleIncrement:SimpleCallback,
  inputString:string,
  onChangeInputString:SimpleCallback<string>,
}) => 
  <>
    <p>The counter is {props.counter}</p>
    <button onClick={() => props.onIncrement()}>
      +1
    </button>
    <button onClick={() => props.onDoubleIncrement()}>
      +2
    </button>
    <p>The input string is {props.inputString}</p>
    <input value={props.inputString} onChange={e => props.onChangeInputString(e.currentTarget.value)} />
  </>
```

> We lovingly refer to these as "dumb stateless React components", but be aware that it's not meant as an insult, but rather praise. The dumber the rendering components are, the better have we achieved separation of concerns.

> One prescription that is not always attainable in practice is independence from the state definitions of the parent domain. Of course sometimes this will be possible, but sometimes this will be impractical. One might consider defining an MVVM-style double model, one for the business objects and one for the visuals, with easy conversions, but this only makes sense when the business models are too complex and also we want to reuse the same rendering component with different business models. In short, your mileage may vary.

There is no reason to say much more about such plain controlled React components: Ballerina 🩰 does not get in the way of the normal manner of writing presentational components, so follow whatever React metaframework/design system/etc. that matches the requirements of your application and go for it!

> Ballerina 🩰 works really well with other frameworks such as Vue and Angular, but more on this later.

We can now bring all of our logic together. The `ParentTemplate` for example will take care of instantiating the templates of the children, its own views, as well as the necessary visual wrappers and the templates that run the domain' coroutines:

```tsx
const Child1TemplateEmbedded = Child1Template
	.mapContext<ParentParentReadonlyContext & ParentWritableState>(p => p.child1)
	.mapState(Parent.Updaters.Core.child1)

const Child2TemplateEmbedded = Child2Template
	.mapContext<ParentReadonlyContext & ParentWritableState>(p => p.child2)
	.mapState(Parent.Updaters.Core.child2)

export const ParentTemplate =
	Template.Default<
		ParentReadonlyContext, ParentWritableState, ParentForeignMutationsExpected>(props =>
			<>
				<ParentTable {...props.context} />
				<ParentInputs
					counter={props.context.counter}
					onIncrement={() => props.setState(Parent.Updaters.Template.tick())}
					onDoubleIncrement={() => props.setState(Parent.Updaters.Template.doubleTick())}
					inputString={props.context.inputString.value}
					onChangeInputString={_ => props.setState(Parent.Updaters.Template.inputString(replaceWith(_)))}
				/>
				<ChildrenWrapper>
					<ChildWrapper>
						<Child1TemplateEmbedded {...props} />
					</ChildWrapper>
					<ChildWrapper>
						<Child2TemplateEmbedded {...props} />
					</ChildWrapper>
				</ChildrenWrapper>
			</>
		).any([
			ParentCoroutinesRunner,
			ParentDebouncerRunner,
		]).mapView(
			ParentWrapper
		)
```

It is quite a handful so let's unpack it bit by bit.


##### Instantiating views components
The first and foremost task of a template is to instantiate the appropriate views. The template has access to the following `props`:
- `context`, which contains both the readonly context as well as the writable state of the template (everything that can be _read_, with type `ReadonlyContext & WritableState`);
- `setState`, which accepts an `Updater<WritableState>` to signal to the template that we wish to perform a mutation on the state;
- `foreignMutations`, which are assorted callbacks that allow us to send signals to other domains.

We pass a subset, or _projection_, of these `props` to the views of the domain, with the goal in mind of letting the view in on as little details as possible about the template itself. The view receives simple callbacks that usually invoke either `props.setState`, or a foreign mutation. The views also do not receive the whole readonly context and writable state, but ideally only the relevant information needed to perform their function, and nothing else.

Very often, in the context of a view, we wish to apply visual wrappers. A wrapper is a React component with children, that is it has signature `{ children?:JSX.Element | Array<JSX.Element> }`. There are two ways to apply a wrapper. One, just like we are used to in the React world, is to simply put it around whatever we want (also other templates, given that they are renderable React elements like all others):

```tsx
<ChildWrapper>
	<Child2TemplateEmbedded {...props} />
</ChildWrapper>
```

The other way is by using `mapView`, which is a method that any templat has and which accepts a wrapper that is applied around the whole template:

```tsx
export const ParentTemplate =
	Template.Default<
		ParentReadonlyContext, ParentWritableState, ParentForeignMutationsExpected>(props =>
			...
		).mapView(
			ParentWrapper
		)
```

Interestingly, both `ParentWrapper` and `ChildWrapper` have the same wrapper signature, so they could both be used in both ways.


##### Instantiating Child templates
Whenever a component has children, like `Parent` does, we also want to instantiate the templates of the children components inside the parent. Of course we need to convert the readonly context, writable state, as well as `setState` and foreign mutations from the parent to the child. We can do this manually, that is nobody is stopping us from writing:

```tsx
	<>
		<Child1Template 
			context={...something from props.context...}
			setState={_ => props.setState(...some translation...)}
			foreignMutations={...something from props.foreignMutations and props.setState...}
		/>
	</>
```

Most children though are easy to _embed_ in the parent context. This features a _narrowing_ of the parent context and state into the, usually smaller, context and state of the child, followed by a _widening_ of the state updaters propagated by the child into state updaters that are applicable for the parent.

> Yes, this is **exactly** the same embedding, narrowing, and widening that we saw with coroutines. What a coincidence!!! It's almost as if we are encountering some fundamental patterns of mathematics that apply to the decomposition of information processing systems!!! Go figure...

We can define an embedded child template which can be used with the same `props` of the parent by calling the methods `mapContext` (narrowing) and `mapState` (widening):

```tsx
const Child2TemplateEmbedded = Child2Template
	.mapContext<ParentReadonlyContext & ParentWritableState>(p => p.child2)
	.mapState(Parent.Updaters.Core.child2)
```

Narrowing usually just picks/singles out the subset of the readonly context and state of the child from the readonly context and state of the parent. It is usually quite a simple selection, almost trivial.
Widening takes as input an `Updater<child>` and converts it to an `Updater<parent>` through the appropriate `simpleUpdater`. It is also usually quite simple and almost trivial, if one does not think too hard about the level of nesting of higher order functions hidden all over this little call.

Note that we always need to pass the context of the parent as a generic argument to `mapContext`: when embedding a child template, the type inference of Typescript cannot possibly guess which parent component we are embedding into, so we do need to provide this information explicitly.

Then we can simply invoke the embedded component with the `props` of the parent without any extra effort:

```tsx
	<Child2TemplateEmbedded {...props} />
```

So pretty 🩰


##### Instantiating coroutines
Finally, whenever coroutines are present in a domain, we run them. This can be done by simply instantiating their runners (which are templates themselves thanks to `Co.Template`) as follows:

```tsx
	<>
		...
		<ParentCoroutinesRunner {...props} />
		<ParentDebouncerRunner {...props} />
	</>
```

A cute alternative passes an array of extra templates to just slam on the DOM somewhere at the discretion of the template to the `any` method of templates. This separates the rest of the logic of the template (views, inputs, children) from the coroutines, which sort of exist in their own little world anyway:

```tsx
export const ParentTemplate =
	Template.Default<
		ParentReadonlyContext, ParentWritableState, ParentForeignMutationsExpected>(props =>
			<>
				...
			</>
		).any([
			ParentCoroutinesRunner,
			ParentDebouncerRunner,
		])
```

I really like the second variant but whatever, you know?


# Instantiating domains
...

_State management across domains_
   _useState_
 	_reminder that this is the place where foreign mutations happen_
_Core vs feature domains_
	_The octaves of an application_
_Advanced patterns_
  _Parent with N children in a Map or OrderedMap_
  _Asynchronous validation_
  _Infinite streams_
	  _Prevent pointless running_
  _Case updater_
  _Coroutine.On and Trigger_
	  _Maybe with a slightly inference-friendlier implementation?_
  _Manually running a coroutine_
  _Filters_
	_useMemo_
	_multi-field form validation_
	_whole form validation in one go_
_Extensible generic domains_

_Process Giulia's feedback_