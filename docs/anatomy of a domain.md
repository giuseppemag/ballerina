---
marp: true

---

<!-- theme: gaia -->
<style>
  @font-face {
    font-family: "Apercu";
    src: url(https://legacy.grandeomega.com/css/fonts/Apercu-Mono.ttf) format("truetype");
  }

  :root {
    /* --color-background: #487ced;
    --color-foreground: #ffedf5;
    --color-highlight: #ffedf5;
    --color-dimmed: #ffedf5; */
    /* --color-background: #083d34;
    --color-foreground: #e3e8e7;
    --color-highlight: #35a674;
    --color-dimmed: #35a674; */

--color-background: #3A36AE;
    --color-foreground: #FCEEF5;
    --color-highlight: #E0569B;
    --color-dimmed: #E0569B;

/* --color-background: #FCEEF5;
    --color-foreground: #3A36AE;
    --color-highlight: #E0569B;
    --color-dimmed: #E0569B; */

  }

  code {
   font-family:  "Fira code";
  }  
</style>


# <!-- fit --> Anatomy of a Ballerina 🩰 domain 
by Dr Giuseppe Maggiore
[github.com/giuseppemag/ballerina](github.com/giuseppemag/ballerina)

---

# About Ballerina 🩰
Ballerina is an open source frontend framework based, but not tied, to React
- It promotes code reuse and modularity
- It frees from npm dependency Hell by promoting high quality code
- It is write-once, run anywhere (thanks to React Native)
- It is future-proof: future versions of React and also other frameworks (Vue and Ng) work with Ballerina 🩰

---

# What is a domain?
A modular, composable, self-contained unit of frontend code with
- State
- State transitions (updaters)
- Background processes
- Templates
- Rendering

---

# State
Consider a fictional, nonsensical domain, `Child2`, containing two simple fields.

Its state will be:

```ts
export type Child2 = { a: number; b: string; };
```

---

# State transitions
All allowed operations on the `Child2` are in its _repository_ object.

```ts
export const Child2 = {
	Default:() : Child2 => ({ a:1, b:"" }),
	Updaters: {
		Core: {
			...simpleUpdater<Child2>()("a"),
			...simpleUpdater<Child2>()("b"),
		}
	},
	ForeignMutations:(_:ForeignMutationsInput<Child2ReadonlyContext, Child2WritableState>) => ({})
};
```

---

# State transitions
The _Core_ updaters allow access to the `Child2` fields. These are low-level updaters. We can also find _Template_ and _Coroutine_ updaters that are specifically meant for user-initiated actions or background processes.

---

# Background processes
One of the coolest features of Ballerina 🩰: coroutines are like supercharged `Promise`s to define animations, timing, parallel processing, and much more.

Let's change the state in a looping automated transformation:

---

# Background processes
```ts
export const Child2Animation = 
  Co.Repeat(
    Co.Seq([
      Co.SetState(Child2.Updaters.Core.a(replaceWith(1)).then(Child2.Updaters.Core.b(replaceWith("")))),
      Co.Wait(250),
      Co.For(Range(0, 3))(_ =>
          Co.Seq([
            Co.SetState(Child2.Updaters.Core.a(_ => _ * 2)),
            Co.Wait(250),
            Co.SetState(Child2.Updaters.Core.b(_ => _ + ".")),
            Co.Wait(250),
          ])
      )
    ])
  );
```


---

# Rendering
So far, everything was plain TypeScript. Self-contained, understandable, and future-proof: this code works on the frontend, backend, nodejs, React, Vue, whatever runs TypeScript!

Now it's time to show stuff on the screen...

---

# Rendering
A very straightforward bit of React in all React' goodness (ok, not in this particular example but you know what I mean):

```tsx
export const Child2Layout: Child2View = ((props) => (
  <>
    <h2>Child 2</h2>
    <Child2Table {...props.context} />
    <Child2Input onClick={() => props.foreignMutations.setFlag(true)}/>
  </>
));
```

---

# Templates
We then bring it all together. The template defines the input and output of the domain from a React perspective, as well as defines the structure of the view:

```ts
export type Child2ReadonlyContext = Unit
export type Child2WritableState = Child2
export type Child2ForeignMutationsExpected = { setFlag:SimpleCallback<boolean> }
export type Child2ForeignMutationsExposed = ReturnType<typeof Child2.ForeignMutations>
export type Child2View = View<Child2ReadonlyContext & Child2WritableState, Child2WritableState, Child2ForeignMutationsExpected>

```

---

# Templates
Given all the inputs and outputs, the template just invokes the view and runs the coroutine:

```tsx
export const Child2Template = Template.Default<
  Child2ReadonlyContext,
  Child2WritableState,
  Child2ForeignMutationsExpected,
  Child2View
>((props) => <props.view {...props} />).any([Child2CoroutinesRunner]);
```

---

# <!-- fit --> And that's it!
We have just scratched the surface of Ballerina 🩰's potential, but now we are armed with the basics: properly modularized, standardized, separated units of code!

And that's already a lot!
