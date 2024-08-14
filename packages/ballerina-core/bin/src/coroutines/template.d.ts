import { Unit } from "../fun/domains/unit/state";
import { BasicFun } from "../fun/state";
import { Coroutine } from "./state";
import { Template, TemplateProps } from "../template/state";
export type CoroutineComponentOptions<context, state> = {
    interval?: number;
    key?: BasicFun<TemplateProps<context & state, state, Unit>, string>;
    restartWhenFinished?: boolean;
    runFilter?: BasicFun<TemplateProps<context & state, state, Unit>, boolean>;
};
type CoroutineReadonlyContext<context, state> = {
    initialCoroutine: Coroutine<context, state, Unit>;
    options?: CoroutineComponentOptions<context, state>;
};
export declare const CoroutineTemplate: <context, state, foreignMutations>() => Template<context & CoroutineReadonlyContext<context, state> & state, state, foreignMutations, Unit>;
export {};
//# sourceMappingURL=template.d.ts.map