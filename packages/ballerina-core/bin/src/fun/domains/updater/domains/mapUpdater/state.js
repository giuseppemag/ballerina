import { Fun } from "../../../../state";
import { unit } from "../../../unit/state";
import { Updater } from "../../state";
export const mapUpdater = () => (field, displayName) => ({
    [displayName]: {
        add: Fun(([key, value]) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].set(key, value) })))),
        remove: Fun((key) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].remove(key) })))),
        set: Fun((key) => (Fun((fieldUpdater) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].has(key) == false ? entity[field] :
                entity[field].set(key, fieldUpdater(entity[field].get(key))) })))))),
        upsert: Fun(([key, fallback, fieldUpdater]) => Updater(entity => (Object.assign(Object.assign({}, entity), { [field]: entity[field].set(key, entity[field].has(key) ?
                fieldUpdater(entity[field].get(key))
                : fallback(unit)) })))),
    }
});
//# sourceMappingURL=state.js.map