import { BasicFun, Fun } from "../../state";

export type BasicPredicate<c> = BasicFun<c, boolean>;
export type Predicate<c> = Fun<c, boolean> & {
  not: () => Predicate<c>;
  and: (other: Predicate<c>) => Predicate<c>;
  or: (other: Predicate<c>) => Predicate<c>;
};

export const Predicate = Object.assign(
  <c>(actual: BasicPredicate<c>): Predicate<c> =>
    Object.assign(Fun(actual), {
      not: function (this: Predicate<c>): Predicate<c> {
        return Predicate((_) => !this(_));
      },
      and: function (this: Predicate<c>, other: Predicate<c>): Predicate<c> {
        return Predicate((_) => this(_) && other(_));
      },
      or: function (this: Predicate<c>, other: Predicate<c>): Predicate<c> {
        return Predicate((_) => this(_) || other(_));
      },
    }),
  {
    True: <c>() => Predicate<c>((_) => true),
    False: <c>() => Predicate<c>((_) => false),
  },
);
