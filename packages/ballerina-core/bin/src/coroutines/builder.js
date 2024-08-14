import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { createTemplate } from "../template/state";
import { Coroutine } from "./state";
import { CoroutineTemplate } from "./template";
export const CoTypedFactory = Object.assign(() => ({
    Seq: (Coroutine.Seq),
    GetState: (Coroutine.GetState),
    SetState: (Coroutine.SetState),
    UpdateState: (Coroutine.UpdateState),
    Any: (Coroutine.Any),
    All: (ps) => Coroutine.All(ps),
    Yield: (Coroutine.Yield),
    Wait: (Coroutine.Wait),
    Await: (p, onErr, debugName) => Coroutine.Await(p, onErr, debugName),
    Repeat: (Coroutine.Repeat),
    Return: (res) => Coroutine.Return(res),
    While: (Coroutine.While),
    For: (collection) => (p) => Coroutine.For(collection, p),
    Embed: (p, narrow, widen) => Coroutine.Embed(p, narrow, widen),
    Template: (initialCoroutine, options) => createTemplate(props => ((options === null || options === void 0 ? void 0 : options.runFilter) || (_ => true))(Object.assign(Object.assign({}, props), { foreignMutations: {} })) ? CoroutineTemplate()(Object.assign(Object.assign({}, props), { context: Object.assign(Object.assign({}, props.context), { initialCoroutine,
            options }) })) : _jsx(_Fragment, {})),
    Trigger: (event) => Coroutine.Trigger(event),
    Do: (action) => Coroutine.Do(action),
}), {
    withOn: () => (Object.assign(Object.assign({}, CoTypedFactory()), { On: (kind, filter) => {
            return Coroutine.On(kind, filter);
        } }))
});
//# sourceMappingURL=builder.js.map