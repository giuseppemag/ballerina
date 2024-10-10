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


# <!-- fit --> The Ballerina 🩰 singleton manager (aka form system)
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

# What is a form?
A form is a domain focused on interaction with a single entity that 
- shows the entity field by field
- (including nested entities)
- exposes the changes to the entity via callbacks
- manages the internal form state (async stuff)
- allows debounced, asynchronous validation of the changes
- allows declarative hiding of the fields

---

# Entities
It all starts with the _entities_ we want to process. 

Our entities are nested:
- address
- person (with address)

---

# Address

```ts
export type Address = {
  street: string;
  number: number;
  city: CollectionSelection<City>;
};
```

---

# Person

```ts
export type Person = {
  name: string;
  surname: string;
  birthday: Date;
  subscribeToNewsletter: boolean;
  gender: CollectionSelection<Gender>;
  interests: OrderedMap<Guid, Interest>;
  departments: OrderedMap<Guid, Department>;
  address: Address;
};
```
---

# Form state
A form needs a `FormState`. The `FormState` contains all the ephemeral data that is needed in order to handle the internal form processes.

For example, when editing a `Date`, the entity itself will contain a `Date` field, but we will store the string typed by the user, which might not convert to a `Date` (yet), in the `FormState`.
Another example: when showing an infinite dropdown, the stream of options we are downloading will be stored in the `FormState`, and only the selected option will go to the entity.

We keep entity and form state separate.

---

# Form state types
We define the form state type by specifying all of the fields of the entity which need some special (type-safe) storage:

```ts
export type AddressFormState = FormStateFromEntity<Address, {
  city: SearchableInfiniteStreamState<City>;
}>;

export type PersonFormState = FormStateFromEntity<Person, {
  birthday: DateFormState;
  gender: EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Gender>, Gender>;
  interests: EnumFormState<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Interest>, Interest>;
  departments: SearchableInfiniteStreamState<Department>;
  address: AddressFormState;
}>;
```

> FYI: these are all the possible types of field form state. Also note the nesting.

---

# Form config
We now create the form configuration itself (type-safe) by attaching handlers to each field:

```ts
export const AddressFormBuilder = Form<Address, AddressFormState, PersonFormPredicatesContext, Unit>().Default<keyof Address>();
export const AddressFormConfig = AddressFormBuilder.config(
  {
    street: StringForm<PersonFormPredicatesContext & FormLabel, Unit>(
      _ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["street should be at least 3 characters long"] : [])]))
      .withView(PersonFieldViews.StringView())
      .mapContext(_ => ({ ..._, label: "street" })),
    number: NumberForm<PersonFormPredicatesContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
      .withView(PersonFieldViews.NumberView())
      .mapContext(_ => ({ ..._, label: "number" })),
    city: SearchableInfiniteStreamForm<City, PersonFormPredicatesContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.kind == "r" ? ["a city must be selected"] : [])]))
      .withView(PersonFieldViews.InfiniteStreamView())
      .mapContext(_ => ({ ..._, label: "city" })),
  }
);
```

> `StringForm`, `NumberForm`, `SearchableInfiniteStreamForm` are built-in from Ballerina. 
> We inject our own views (`PersonFieldViews.NumberView()`).

---

# Zooming in
Let's take a closer look to a single field:

```ts
street: StringForm<PersonFormPredicatesContext & FormLabel, Unit>(
  _ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["street should be at least 3 characters long"] : [])]))
  .withView(PersonFieldViews.StringView())
  .mapContext(_ => ({ ..._, label: "street" })),
```

The first argument is the `async` validation function, which returns an array of errors. Can also resolve immediately client-side.
We `mapContext` because our context expects a label which needs to be provided manually per field.

---

# Address form
We can now create the actual `Address` form:

```ts
export const AddressForm = AddressFormBuilder.template(AddressFormConfig, _ => PromiseRepo.Default.mock(() => []));
```

We provide an async validation function for the whole entity, for those validations that look at the whole entity at once instead of field by field.

---

# Person form
Same story as for the address:

```ts
export const PersonFormBuilder = Form<Person, PersonFormState, PersonFormPredicateContext & { columns: [Array<keyof Person>, Array<keyof Person>, Array<keyof Person>] }, Unit>().Default<keyof Person>()
export const PersonForm = PersonFormBuilder.template({
  name: StringForm<PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.length < 3 ? ["name should be at least 3 characters long"] : [])]))
    .withView(PersonFieldViews.StringView())
    .mapContext(_ => ({ ..._, label: "name" })),
  // ... some fields removed to save space
  gender: EnumForm<PersonFormPredicateContext & FormLabel & BaseEnumContext<PersonFormPredicateContext, Gender>, Unit, Gender>(_ => PromiseRepo.Default.mock(() => []))
    .withView(PersonFieldViews.EnumView())
    .mapContext(_ => ({ ..._, label: "gender", getOptions: PersonApi.getGenders })),
  departments: InfiniteMultiselectDropdownForm<Department, PersonFormPredicateContext & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => [...(_.count() <= 0 ? ["please select at least one department"] : [])]))
    .withView(PersonFieldViews.InfiniteStreamMultiselectView())
    .mapContext(_ => ({ ..._, label: "department" })),
  address: AddressForm
    .withView(AddressView)
    .mapContext(_ => ({
      ..._,
      visibleFields: Address.Operations.VisibleFields
    })),
}, PersonApi.validate)

```

---

# Address inside person
A form template, in our case `Address`, needs a special parameter: the visible fields. For each field, a predicate that computes visibility:

```ts
address: AddressForm
  .withView(AddressView)
  .mapContext(_ => ({
    ..._,
    visibleFields: Address.Operations.VisibleFields
  })),
```

---

# Address visible fields
For address, the visible fields look like this:

```ts
VisibleFields: OrderedMap<keyof Address, Predicate<PersonFormPredicateContext>>([
  ["city", PersonFormPredicateContext.Predicates.BC.or(PersonFormPredicateContext.Predicates.FO)],
  ["street", PersonFormPredicateContext.Predicates.SubscribedToNewsletter],
  ["number", PersonFormPredicateContext.Predicates.True]])
```

The `City` will only be shown when on of the `BC` or `FO` predicates is `true`.

---

# Instantiating the forms
We need the states somewhere:

```ts
const [personFormState, setPersonFormState] = useState(PersonFormState.Default(""))
const [personState, setPersonState] = useState(Person.Default.mocked())
```

---

# Instantiating the forms
We run the form as a regular React component:

```tsx
<PersonForm
  context={{
    ...personFormState, value: personState, visibleFields: Person.Operations.VisibleFields, flags: Set(["BC"]),
  }}
  setState={setPersonFormState}
  view={PersonView}
  foreignMutations={{ onChange: setPersonState}}
/>
```

Changes to the form state go via `setState`, changes to the entity go via `foreignMutations::onChange`.

---

# <!-- fit --> And that's it!
Ballerina 🩰 can save a lot of effort when dealing with managing entities, so good luck and happy coding!
