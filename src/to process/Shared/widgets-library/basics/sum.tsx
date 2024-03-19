import { BasicFun as BasicFun, id } from "./fun";

/** the sum of two types, which is the discriminated union and not just the union of those types.
 * @todo (Breaking change): move to the shorter definition (with one less .v access):
 * ```typescript
 * export type Sum_<l,r> = {kind: "l", v : l} | {kind: "r", v: r}
 * ```
 */

export type Sum<l, r> = ({ kind: "l"; v: l } | { kind: "r"; v: r }) & {
  mapLeft: <l1>(f: BasicFun<l, l1>) => Sum<l1, r>;
  mapRight: <r1>(f: BasicFun<r, r1>) => Sum<l, r1>;
  map2: <l1, r1>(l: BasicFun<l, l1>, r: BasicFun<r, r1>) => Sum<l1, r1>;
  visit: <c>(l: BasicFun<l, c>, r: BasicFun<r, c>) => c;
};
const inl = <l, r>(l: l): Sum<l, r> => ({
  kind: "l",
  v: l,
  mapLeft(f) {
    return mapLeft(this, f);
  },
  mapRight(f) {
    return mapRight(this, f);
  },
  map2(l, r) {
    return map2(this, l, r);
  },
  visit(l, r) {
    return visit(this, l, r);
  },
});
const inr = <l, r>(r: r): Sum<l, r> => ({
  kind: "r",
  v: r,
  mapLeft(f) {
    return mapLeft(this, f);
  },
  mapRight(f) {
    return mapRight(this, f);
  },
  map2(l, r) {
    return map2(this, l, r);
  },
  visit(l, r) {
    return visit(this, l, r);
  },
});
// const deconstruct = <l, r, c>(onL: Fun<l, c>, onR: Fun<r, c>, v: Sum<l, r>): c => v.kind == "l" ? onL(v.v) : onR(v.v);
// const deconstructCurried = <l, r, c>(onL: Fun<l, c>, onR: Fun<r, c>) => (v: Sum<l, r>): c => v.kind == "l" ? onL(v.v) : onR(v.v);

const visit = <l, r, c>(
  self: Sum<l, r>,
  l: BasicFun<l, c>,
  r: BasicFun<r, c>
): c => (self.kind == "l" ? l(self.v) : r(self.v));
const map2 = <l, r, l1, r1>(
  self: Sum<l, r>,
  l: BasicFun<l, l1>,
  r: BasicFun<r, r1>
): Sum<l1, r1> =>
  self.kind == "l" ? Sum.CreateLeft(l(self.v)) : Sum.CreateRight(r(self.v));
const mapLeft = <l, r, l1>(self: Sum<l, r>, f: BasicFun<l, l1>): Sum<l1, r> =>
  map2(self, f, id);
const mapRight = <l, r, r1>(self: Sum<l, r>, f: BasicFun<r, r1>): Sum<l, r1> =>
  map2(self, id, f);

export const Sum = {
  CreateLeft: inl,
  CreateRight: inr,
  Updaters: {
    Left:
      <l, r, l1>(f: BasicFun<l, l1>): BasicFun<Sum<l, r>, Sum<l1, r>> =>
      (sum) =>
        sum.kind == "r" ? inr(sum.v) : inl(f(sum.v)),
    Right:
      <l, r, r1>(f: BasicFun<r, r1>): BasicFun<Sum<l, r>, Sum<l, r1>> =>
      (sum) =>
        sum.kind == "l" ? inl(sum.v) : inr(f(sum.v)),
    Both:
      <l, r, l1, r1>(
        l: BasicFun<l, l1>,
        r: BasicFun<r, r1>
      ): BasicFun<Sum<l, r>, Sum<l1, r1>> =>
      (sum) =>
        sum.kind == "l" ? inl(l(sum.v)) : inr(r(sum.v)),
    Visit:
      <l, r, c>(l: BasicFun<l, c>, r: BasicFun<r, c>): BasicFun<Sum<l, r>, c> =>
      (sum) =>
        sum.visit(l, r),
  },
};
