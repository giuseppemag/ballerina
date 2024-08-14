import { Fun } from "../../../../state";
import { Unit } from "../../../unit/state";
import { BasicUpdater, Updater } from "../../state";
export type Widening<p, c extends keyof p> = Fun<BasicUpdater<p[c]>, Updater<p>>;
export type SimpleUpdater<Entity, Field extends keyof Entity> = Required<{
    [f in Field]: Widening<Entity, Field>;
}>;
export declare const simpleUpdater: <Entity>() => <Field extends keyof Entity>(field: Field) => SimpleUpdater<Entity, Field>;
export type WidenedChildren<p, children> = {
    [k in Exclude<keyof children, "Core" | "Template" | "Coroutine">]: children[k] extends WideningWithChildren<infer child, infer nephew, infer nephews> ? Fun<BasicUpdater<child[nephew]>, Updater<p>> & {
        children: WidenedChildren<p, nephews>;
    } : children[k] extends Widening<infer child, infer nephew> ? Fun<BasicUpdater<child[nephew]>, Updater<p>> : "cannot invoke custom updaters through automated nesting";
} & (children extends {
    Core: Unit;
} ? {
    Core: WidenedChildren<p, children["Core"]>;
} : Unit) & (children extends {
    Template: Unit;
} ? {
    Template: WidenedChildren<p, children["Template"]>;
} : Unit) & (children extends {
    Coroutine: Unit;
} ? {
    Coroutine: WidenedChildren<p, children["Coroutine"]>;
} : Unit);
export type WideningWithChildren<p, c extends keyof p, children> = Fun<BasicUpdater<p[c]>, Updater<p>> & {
    children: WidenedChildren<p, children>;
};
export type SimpleUpdaterWithChildren<Entity, Field extends keyof Entity, children> = {
    [f in Field]: WideningWithChildren<Entity, Field, children>;
};
export declare const simpleUpdaterWithChildren: <Entity>() => <children>(children: children) => <Field extends keyof Entity>(field: Field) => SimpleUpdaterWithChildren<Entity, Field, children>;
export declare const widenChildren: <p, child, children>(childToParent: Fun<BasicUpdater<child>, Updater<p>>, children: children) => WidenedChildren<p, children>;
//# sourceMappingURL=state.d.ts.map