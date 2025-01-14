import { BasicFun, Fun } from "../../../fun/state";
import { Value } from "../../../value/state";

export type ValueOrError<v, e> =
  | (Value<v> & { kind: "value" })
  | { errors: e[]; kind: "errors" };
export const ValueOrError = {
  Default: {
    value: <v, e>(_: v): ValueOrError<v, e> => ({
      ...Value.Default(_),
      kind: "value",
    }),
    errors: <v, e>(_: e[]): ValueOrError<v, e> => ({
      errors: _,
      kind: "errors",
    }),
  },
  Operations: {
    return: <v, e>(_: v): ValueOrError<v, e> => ValueOrError.Default.value(_),
    throw: <v, e>(_: e): ValueOrError<v, e> => ValueOrError.Default.errors([_]),
    map: <a, b, e>(
      f: BasicFun<a, b>
    ): Fun<ValueOrError<a, e>, ValueOrError<b, e>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return _;
        }
        return ValueOrError.Default.value(f(_.value));
      }),
    mapErrors: <e>(f: BasicFun<e, e>): BasicFun<ValueOrError<unknown, e>, ValueOrError<unknown, e>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return ValueOrError.Default.errors(_.errors.map(f));
        }
        return _;
      }),
    flatten: <a, e>(): Fun<
      ValueOrError<ValueOrError<a, e>, e>,
      ValueOrError<a, e>
    > =>
      Fun((_) => {
        if (_.kind == "errors") {
          return _;
        } else if (_.value.kind == "errors") {
          return ValueOrError.Default.errors(_.value.errors);
        } else {
          return _.value;
        }
      }),
    then: <a, b, e>(
      k: BasicFun<a, ValueOrError<b, e>>
    ): BasicFun<ValueOrError<a, e>, ValueOrError<b, e>> =>
      Fun((_) =>
        ValueOrError.Operations.map<a, ValueOrError<b, e>, e>(k).then(
          ValueOrError.Operations.flatten<b, e>()
        )(_)
      ),
    all: <v, e>(_: ValueOrError<v, e>[]): ValueOrError<v[], e> => {
      if (_.every((_) => _.kind == "value")) {
        return ValueOrError.Default.value(_.map((_) => _.value));
      }
      return ValueOrError.Default.errors(
        _.reduce((acc, curr) => {
          if (curr.kind == "errors") {
            return [...acc, ...curr.errors];
          }
          return acc;
        }, [] as e[])
      );
    },
  },
};
