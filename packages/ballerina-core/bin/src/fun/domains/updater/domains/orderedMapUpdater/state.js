import { Fun } from "../../../../state";
import { Updater } from "../../state";
export const orderedMapUpdater = () => (field, displayName) => ({
    [displayName]: {
        add: Fun(([key, value]) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].set(key, value) })))),
        remove: Fun((key) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].remove(key) })))),
        set: Fun((key) => (Fun((fieldUpdater) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].has(key) == false ? entity[field] :
                entity[field].set(key, fieldUpdater(entity[field].get(key))) })))))),
    }
});
//# sourceMappingURL=state.js.map