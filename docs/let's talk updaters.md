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
   // font-family:  "Fira code";
  }  
</style>


# Let's talk updaters in Ballerina 🩰
by Dr Giuseppe

---
# What is the problem here?
- Our frontend is a highly concurrent environment
- Promises want to update the state of the app
- User actions want to update the state of the app
- Animations want to update the state of the app
- Business logic processes want to update the state of the app

**All at the same time**
**CONCURRENCY ALERT!!!!***

---
# What do we want?
- We want to define _composable update operations_
- That is, update operations that even if they happen at the same time, can be chained safely
- As opposed to "the last operation overwrites the others"

---
# Let's start with the FUNdations
A basic function is just a generic lambda in two type parameters

```ts
export type BasicFun<a,b> = (_:a) => b
```

---
# Fun
From a basic function, we can construct a `Fun`, which is the same, but composable.

```ts
export type Fun<a,b> = BasicFun<a,b> & { then<c>(other:BasicFun<b,c>) : Fun<a,c> }

export const Fun = <a,b>(_:BasicFun<a,b>) : Fun<a,b> =>
  Object.assign(_, {
    then: function <c>(this:Fun<a,b>, other:BasicFun<b,c>) : Fun<a,c> {
      return Fun(_ => other(this(_)))
    }
  })
```

---
# Fun composition
```ts
const incr: Fun<number,number> = Fun(_ => _ + 1)
const decr: Fun<number,number> = Fun(_ => _ - 1)
const doub: Fun<number,number> = Fun(_ => _ * 2)
const halv: Fun<number,number> = Fun(_ => _ / 2)

const f = incr.then(doub).then(decr)
console.log(f(5)) // prints 11
```

---
# Updaters
A special subset of `Fun` is `Updater`. Let's start with its basic definition:

```ts
export type BasicUpdater<e> = BasicFun<e, e>;
```

---
# Composable updaters
Updaters are _closed under composition_, meaning that two updaters give rise to a new updater when composed. They are like the noble families among all `Fun`s, but undercover an `Updater` is after all just a `Fun`.

```ts
export type Updater<e> = BasicUpdater<e> & {
  fun: Fun<e, e>;
  then(other: BasicUpdater<e>): Updater<e>;
};
```

---
# Composable updaters
And the constructor/factory:

```ts
export const Updater = <e>(u: BasicUpdater<e>): Updater<e> => {
  return Object.assign(u, {
    fun: Fun(u),
    then: function (this: Updater<e>, other: BasicUpdater<e>): Updater<e> {
      return Updater<e>(_ => other(this(_)));
    },
  });
}
```

---
# Updaters special composition
Updaters do not just compose with `.then`. They also compose _vertically_, meaning from smaller to bigger states.

This is very powerful when dealing with nested states (meaning, always) like:

```ts
type City = { name: string, population: number }
type Address = { street: string, number: number, city: City}
type Person = { name: string, surname: string, address: Address }
```


---
@ Widening
We introduce the concept of _widening_: from a smaller updater of a single field (`c`, stands for _child_), to the bigger updater of the whole state (`p`, stands for _parent_):

```ts
export type Widening<p, c extends keyof p> = Fun<BasicUpdater<p[c]>, Updater<p>>;
```

---
### Automatic generation of widening
Widening can be generated automatically from a type and a field (yes, TypeScript is awesome):

```ts
export type SimpleUpdater<Entity, Field extends keyof Entity> = Required<{
  [f in Field]: Widening<Entity, Field>;
}>;
export const simpleUpdater = <Entity>() => <Field extends keyof Entity>(field: Field): SimpleUpdater<Entity, Field> => ...
```

---
# Simple widening in action
We can use widening to turn an updater of a field into an updater of the whole parent:

```ts
const Person = {
  Default: (): Person => ({
    name: "John", surname: "Doe", address: Address.Default()
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Person>()("name"),
      ...simpleUpdater<Person>()("surname"),
      ...simpleUpdaterWithChildren<Person>()(Address.Updaters)("address"),
    }
  }
}
```

---
# Using it
Let's add the title "Dr." to the name of person `p`:

```ts
Person.Updaters.Core.name(_ => `Dr. ${_}`)(p)
```

---
# Using it
Let's change both name and surname of person `p`:

```ts
Person.Updaters.Core.name(_ => `Dr. ${_}`).then(
  Person.Updaters.Core.surname(_ => `${_}, von`)
)(p)
```


---
# Widening in action
Thanks to widening, we can define insanely powerful chains of nested and sequential updaters with barely any effort:

```ts
Person.Updaters.Core.name(_ => `Dr. ${_}`).then(
  Person.Updaters.Core.surname(_ => `${_}, von`)
).then(
  Person.Updaters.Core.address.children.Core.city.Core.name(_ => `${_} the Great`)
)
```

---
# Seriously?
Yes, and even better: you quickly get mechanical with these patterns.

> Be warned: they are totally addictive. Don't complain to me if you can't stop using them once you learned them.

---
# Conclusion
Updaters are a special subset of functions.
They can compose horizontally (`.then` chaining). Cool.
They can compose vertically (widening) for mind-blowing separation of concerns across reusable application domains.

They work well with concurrency and are supported one-to-one out of the box by frameworks such as React.

---
# Conclusion
Powered by Ballerina 🩰
[github.com/giuseppemag/ballerina](github.com/giuseppemag/ballerina)

![bg right](./pics/smiling-dude.png)




