import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";
export type MaybeUpdater<Entity, Field extends keyof Entity> = Entity extends {
    [_ in Field]: infer value | undefined;
} ? Required<{
    [f in Field]: Fun<BasicUpdater<value>, Updater<Entity>> & {
        both: Fun<BasicUpdater<value | undefined>, Updater<Entity>>;
    };
}> : Entity extends {
    [_ in Field]?: infer value;
} ? Required<{
    [f in Field]: Fun<BasicUpdater<value>, Updater<Entity>> & {
        both: Fun<BasicUpdater<value | undefined>, Updater<Entity>>;
    };
}> : "Error: maybeUpdater has been invoked on a field which cannot be undefined";
export declare const maybeUpdater: <Entity>() => <Field extends keyof Entity>(field: Field) => MaybeUpdater<Entity, Field>;
//# sourceMappingURL=state.d.ts.map