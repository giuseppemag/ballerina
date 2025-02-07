// import { Predicate } from "ballerina-core";
// import { Person, PersonFormState } from "../state";
// import { Set } from "immutable"

// export type PersonFormPredicateContextFlags = "BC" | "F&O" | "SAP" | "SIMPLIFIED" | "SUPER ADMIN";
// export type PersonFormPredicateContext = { flags: Set<PersonFormPredicateContextFlags>; person: Person; formState: PersonFormState; showAllErrors: boolean; };
// export const PersonFormPredicateContext = {
//   Predicates: {
//     True: Predicate((_: PersonFormPredicateContext) => true),
//     False: Predicate((_: PersonFormPredicateContext) => false),
//     SubscribedToNewsletter: Predicate((_: PersonFormPredicateContext) => _.person.subscribeToNewsletter),
//     BC: Predicate((_: PersonFormPredicateContext) => _.flags.has("BC")),
//     FO: Predicate((_: PersonFormPredicateContext) => _.flags.has("F&O")),
//     SAP: Predicate((_: PersonFormPredicateContext) => _.flags.has("SAP")),
//     Simplified: Predicate((_: PersonFormPredicateContext) => _.flags.has("SIMPLIFIED")),
//     SuperAdmin: Predicate((_: PersonFormPredicateContext) => _.flags.has("SUPER ADMIN")),
//   }
// };
