import { id } from "../../../fun/domains/id/state";
import { Updater } from "../../../fun/domains/updater/state";
import { Fun } from "../../../fun/state";
export const LeftValue = {
    Updaters: {
        value: (_) => Updater((v) => (Object.assign(Object.assign({}, v), { value: _(v.value) }))),
    },
};
export const RightValue = {
    Updaters: {
        value: (_) => Updater((v) => (Object.assign(Object.assign({}, v), { value: _(v.value) }))),
    },
};
export const Sum = Object.assign(() => ({
    Default: {
        left: Fun((_) => ({ value: _, kind: "l" })),
        right: Fun((_) => ({ value: _, kind: "r" })),
    },
    Updaters: {
        left: Fun((_) => Updater(Sum().Updaters.map2(_, id))),
        right: Fun((_) => Updater(Sum().Updaters.map2(id, _))),
        map2: (l, r) => Sum().Operations.fold(Fun(l).then(Sum().Default.left), Fun(r).then(Sum().Default.right)),
    },
    Operations: {
        fold: (l, r) => Fun((_) => (_.kind == "l" ? l(_.value) : r(_.value))),
    },
}), {
    Default: {
        left: (_) => ({ value: _, kind: "l" }),
        right: (_) => ({ value: _, kind: "r" }),
    },
    Updaters: {
        left: (_) => Updater(Sum.Updaters.map2(_, id)),
        right: (_) => Updater(Sum.Updaters.map2(id, _)),
        map2: (l, r) => Sum.Operations.fold(Fun(l).then((Sum.Default.left)), Fun(r).then((Sum.Default.right))),
    },
    Operations: {
        fold: (l, r) => Fun((_) => (_.kind == "l" ? l(_.value) : r(_.value))),
    },
});
export const Either = Sum;
//# sourceMappingURL=state.js.map