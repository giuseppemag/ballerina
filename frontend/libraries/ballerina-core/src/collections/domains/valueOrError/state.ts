import { List } from "immutable";
import { BasicFun, BasicFun2, Fun } from "../../../fun/state";
import { Value } from "../../../value/state";

export type ValueOrError<v, e> = (
  | (Value<v> & { kind: "value" })
  | { errors: List<e>; kind: "errors" }
) & {
  map: <a, b, e>(
    this: ValueOrError<a, e>,
    f: BasicFun<a, b>
  ) => ValueOrError<b, e>;
  mapErrors: <a, e, e2>(
    this: ValueOrError<a, e>,
    f: BasicFun<e, e2>
  ) => ValueOrError<a, e2>;
  flatten: <a, e>(
    this: ValueOrError<ValueOrError<a, e>, e>
  ) => ValueOrError<a, e>;
  then: <a, b, e>(
    this: ValueOrError<a, e>,
    k: BasicFun<a, ValueOrError<b, e>>
  ) => ValueOrError<b, e>;
};

const operations = {
  map: function <a, b, e>(
    this: ValueOrError<a, e>,
    f: BasicFun<a, b>
  ): ValueOrError<b, e> {
    if (this.kind == "errors") {
      return this;
    }
    return ValueOrError.Default.return(f(this.value));
  },
  mapErrors: function <a, e, e2>(
    this: ValueOrError<a, e>,
    f: BasicFun<e, e2>
  ): ValueOrError<a, e2> {
    if (this.kind == "errors") {
      return ValueOrError.Default.throw(this.errors.map(f));
    }
    return this;
  },
  flatten: function <a, e>(
    this: ValueOrError<ValueOrError<a, e>, e>
  ): ValueOrError<a, e> {
    if (this.kind == "errors") {
      return this;
    } else if (this.value.kind == "errors") {
      return ValueOrError.Default.throw(this.value.errors);
    } else {
      return this.value;
    }
  },
  then: function <a, b, e>(
    this: ValueOrError<a, e>,
    k: BasicFun<a, ValueOrError<b, e>>
  ): ValueOrError<b, e> {
    return this.map(k).flatten();
  },
};

export const ValueOrError = {
  Default: {
    return: <v, e>(_: v): ValueOrError<v, e> => ({
      ...Value.Default(_),
      kind: "value",
      ...operations,
    }),
    throw: <v, e>(_: List<e>): ValueOrError<v, e> => ({
      errors: _,
      kind: "errors",
      ...operations,
    }),
  },
  Operations: {
    return: <v, e>(_: v): ValueOrError<v, e> => ValueOrError.Default.return(_),
    throw: <v, e>(_: e): ValueOrError<v, e> =>
      ValueOrError.Default.throw(List([_])),
    map: <a, b, e>(
      f: BasicFun<a, b>
    ): Fun<ValueOrError<a, e>, ValueOrError<b, e>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return _;
        }
        return ValueOrError.Default.return(f(_.value));
      }),
    mapErrors: <a, e, e2>(
      f: BasicFun<e, e2>
    ): BasicFun<ValueOrError<a, e>, ValueOrError<a, e2>> =>
      Fun((_) => {
        if (_.kind == "errors") {
          return ValueOrError.Default.throw(_.errors.map(f));
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
          return ValueOrError.Default.throw(_.value.errors);
        } else {
          return _.value;
        }
      }),
    fold: <v, e>(
      f: BasicFun2<
        ValueOrError<v, e>,
        ValueOrError<List<v>, e>,
        ValueOrError<List<v>, e>
      >,
      b: ValueOrError<List<v>, e>
    ): Fun<List<ValueOrError<v, e>>, ValueOrError<List<v>, e>> =>
      Fun((_) =>
        _.isEmpty()
          ? b
          : f(_.first(), ValueOrError.Operations.fold(f, b)(_.rest()))
      ),
    then: <a, b, e>(
      k: BasicFun<a, ValueOrError<b, e>>
    ): BasicFun<ValueOrError<a, e>, ValueOrError<b, e>> =>
      Fun((_) =>
        ValueOrError.Operations.map<a, ValueOrError<b, e>, e>(k).then(
          ValueOrError.Operations.flatten<b, e>()
        )(_)
      ),
    all: <v, e>(_: List<ValueOrError<v, e>>): ValueOrError<List<v>, e> =>
      _.reduce((b, a) => {
        if (a.kind == "errors" && b.kind == "errors") {
          return ValueOrError.Default.throw(b.errors.concat(a.errors));
        } else if (a.kind == "errors") {
          return ValueOrError.Default.throw(a.errors);
        } else if (b.kind == "errors") {
          return ValueOrError.Default.throw(b.errors);
        } else {
          return ValueOrError.Default.return(b.value.concat(a.value));
        }
      }, ValueOrError.Default.return(List<v>())),
    all2: <v, e>(_: List<ValueOrError<v, e>>): ValueOrError<List<v>, e> =>
      ValueOrError.Operations.fold<v, e>((a, b) => {
        if (a.kind == "errors" && b.kind == "errors") {
          return ValueOrError.Default.throw(b.errors.concat(a.errors));
        } else if (a.kind == "errors") {
          return ValueOrError.Default.throw(a.errors);
        } else if (b.kind == "errors") {
          return ValueOrError.Default.throw(b.errors);
        } else {
          return ValueOrError.Default.return(b.value.concat(a.value));
        }
      }, ValueOrError.Default.return(List<v>()))(_),
  },
};
