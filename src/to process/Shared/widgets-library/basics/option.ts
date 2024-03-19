import { List } from "immutable";

import { Fun, Unit } from "./fun";
import { Sum } from "./sum";

export type Option<a> = Sum<Unit, a>;
export const none = function <a>(): Option<a> {
  return Sum.CreateLeft<Unit, a>({});
};
export const some = function <a>(v: a): Option<a> {
  return Sum.CreateRight<Unit, a>(v);
};
export const mapO = <a, b>(f: Fun<a, b>, o: Option<a>): Option<b> =>
  o.kind == "r" ? some(f(o.v)) : none();
export const onSome: <a>(f: Fun<a, void>, o: Option<a>) => void = mapO;
export const fromOption = function <a>(def: a, o: Option<a>): a {
  return o.kind == "r" ? o.v : def;
};
export const listFromOption = <a>(x: Option<a>): List<a> =>
  x.kind == "l" ? List<a>() : List<a>().push(x.v);
export const arrayFromOption = <a>(x: Option<a>): Array<a> =>
  x.kind == "l" ? [] : [x.v];
