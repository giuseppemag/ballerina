import { BasicFun, Fun } from "../../../fun/state";
import { Value } from "../../../value/state";

export type ValueOrError2<v, e> = (
  | (Value<v> & { kind: "value" })
  | { errors: e[]; kind: "errors" }
) & {
  map: <a, b, e>(
    this: ValueOrError2<a, e>,
    f: BasicFun<a, b>
  ) => ValueOrError2<b, e>;
  mapErrors: <e>(
    this: ValueOrError2<unknown, e>,
    f: BasicFun<e, e>
  ) => ValueOrError2<unknown, e>;
  flatten: <a, e>(
    this: ValueOrError2<ValueOrError2<a, e>, e>
  ) => ValueOrError2<a, e>;
  then: <a, b, e>(
    this: ValueOrError2<a, e>,
    k: BasicFun<a, ValueOrError2<b, e>>
  ) => ValueOrError2<b, e>;
};

const operations = {
  map: function <a, b, e>(
    this: ValueOrError2<a, e>,
    f: BasicFun<a, b>
  ): ValueOrError2<b, e> {
    if (this.kind == "errors") {
      return this;
    }
    return ValueOrError2.return(f(this.value));
  },
  mapErrors: function <a, e>(
    this: ValueOrError2<a, e>,
    f: BasicFun<e, e>
  ): ValueOrError2<a, e> {
    if (this.kind == "errors") {
      return ValueOrError2.throw(this.errors.map(f));
    }
    return this;
  },
  flatten: function <a, e>(
    this: ValueOrError2<ValueOrError2<a, e>, e>
  ): ValueOrError2<a, e> {
    if (this.kind == "errors") {
      return this;
    } else if (this.value.kind == "errors") {
      return ValueOrError2.throw(this.value.errors);
    } else {
      return this.value;
    }
  },
  then: function <a, b, e>(
    this: ValueOrError2<a, e>,
    k: BasicFun<a, ValueOrError2<b, e>>
  ): ValueOrError2<b, e> {
    return this.map(k).flatten();
  },
};

export const ValueOrError2 = {
  return: <v, e>(_: v): ValueOrError2<v, e> => ({
    ...Value.Default(_),
    kind: "value",
    ...operations,
  }),
  throw: <v, e>(_: e[]): ValueOrError2<v, e> => ({
    errors: _,
    kind: "errors",
    ...operations,
  }),
  All: <v, e>(_: ValueOrError2<v, e>[]): ValueOrError2<v[], e> => {
    if (_.every((_) => _.kind == "value")) {
      return ValueOrError2.return(_.map((_) => _.value));
    }
    return ValueOrError2.throw(
      _.reduce((acc, curr) => {
        if (curr.kind == "errors") {
          return [...acc, ...curr.errors];
        }
        return acc;
      }, [] as e[])
    );
  },
};
