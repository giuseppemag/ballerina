import { List } from "immutable";
import { BasicFun, BasicFun2, Fun } from "../../../fun/state";
import { Value } from "../../../value/state";

export type ValueOrErrors<v, e> = (
  | (Value<v> & { kind: "value" })
  | { errors: List<e>; kind: "errors" }
) & {
  map: <a, b, e>(
    this: ValueOrErrors<a, e>,
    f: BasicFun<a, b>
  ) => ValueOrErrors<b, e>;
  mapErrors: <a, e, e2>(
    this: ValueOrErrors<a, e>,
    f: BasicFun<e, e2>
  ) => ValueOrErrors<a, e2>;
  flatten: <a, e>(
    this: ValueOrErrors<ValueOrErrors<a, e>, e>
  ) => ValueOrErrors<a, e>;
  then: <a, b, e>(
    this: ValueOrErrors<a, e>,
    k: BasicFun<a, ValueOrErrors<b, e>>
  ) => ValueOrErrors<b, e>;
};

const operations = {
  map: function <a, b, e>(
    this: ValueOrErrors<a, e>,
    f: BasicFun<a, b>
  ): ValueOrErrors<b, e> {
    if (this.kind == "errors") {
      return this;
    }
    return ValueOrErrors.Default.return(f(this.value));
  },
  mapErrors: function <a, e, e2>(
    this: ValueOrErrors<a, e>,
    f: BasicFun<e, e2>
  ): ValueOrErrors<a, e2> {
    if (this.kind == "errors") {
      return ValueOrErrors.Default.throw(this.errors.map(f));
    }
    return this;
  },
  flatten: function <a, e>(
    this: ValueOrErrors<ValueOrErrors<a, e>, e>
  ): ValueOrErrors<a, e> {
    if (this.kind == "errors") {
      return this;
    } else if (this.value.kind == "errors") {
      return ValueOrErrors.Default.throw(this.value.errors);
    } else {
      return this.value;
    }
  },
  then: function <a, b, e>(
    this: ValueOrErrors<a, e>,
    k: BasicFun<a, ValueOrErrors<b, e>>
  ): ValueOrErrors<b, e> {
    return this.map(k).flatten();
  },
};

export const ValueOrErrors = {
  Default: {
    return: <v, e>(_: v): ValueOrErrors<v, e> => ({
      ...Value.Default(_),
      kind: "value",
      ...operations,
    }),
    throw: <v, e>(_: List<e>): ValueOrErrors<v, e> => ({
      errors: _,
      kind: "errors",
      ...operations,
    }),
  },
  Operations: {
    return: <v, e>(_: v): ValueOrErrors<v, e> => ValueOrErrors.Default.return(_),
    throw: <v, e>(_: e): ValueOrErrors<v, e> =>
      ValueOrErrors.Default.throw(List([_])),
    map: <a, b, e>(
      f: BasicFun<a, b>
    ): Fun<ValueOrErrors<a, e>, ValueOrErrors<b, e>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return _;
        }
        return ValueOrErrors.Default.return(f(_.value));
      }),
    mapErrors: <a, e, e2>(
      f: BasicFun<e, e2>
    ): BasicFun<ValueOrErrors<a, e>, ValueOrErrors<a, e2>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return ValueOrErrors.Default.throw(_.errors.map(f));
        }
        return _;
      }),
    flatten: <a, e>(): Fun<
      ValueOrErrors<ValueOrErrors<a, e>, e>,
      ValueOrErrors<a, e>
    > =>
      Fun((_) => {
        if (_.kind == "errors") {
          return _;
        } else if (_.value.kind == "errors") {
          return ValueOrErrors.Default.throw(_.value.errors);
        } else {
          return _.value;
        }
      }),
    fold: <v, e, c>(
      l: BasicFun<v, c>,
      r: BasicFun<List<e>, c>
    ): Fun<ValueOrErrors<v, e>, c> => {
      return Fun((_) => (_.kind == "value" ? l(_.value) : r(_.errors)));
    },
    all: <v, e>(_: List<ValueOrErrors<v, e>>): ValueOrErrors<List<v>, e> =>
      _.reduce(
        (reduction, value) =>
          ValueOrErrors.Operations.fold<v, e, ValueOrErrors<List<v>, e>>(
            (v: v) =>
              reduction.kind == "errors"
                ? reduction
                : ValueOrErrors.Default.return(List<v>([v])),
            (es: List<e>) =>
              reduction.kind == "errors"
                ? ValueOrErrors.Default.throw(es.concat(reduction.errors))
                : ValueOrErrors.Default.throw(es)
          )(value),
        ValueOrErrors.Default.return(List<v>())
      ),
  },
};
