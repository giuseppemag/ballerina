import { Fun } from "../../../../state";
import { Updater } from "../../state";
export const simpleUpdater = () => (field) => ({
    [field]: Fun((fieldUpdater) => {
        return Updater(currentEntity => (Object.assign(Object.assign({}, currentEntity), { [field]: fieldUpdater(currentEntity[field]) })));
    }),
});
export const simpleUpdaterWithChildren = () => (children) => (field) => ({
    [field]: Object.assign(Fun((fieldUpdater) => {
        const basicUpdater = currentEntity => (Object.assign(Object.assign({}, currentEntity), { [field]: fieldUpdater(currentEntity[field]) }));
        return Updater(basicUpdater);
    }), { children: widenChildren(simpleUpdater()(field)[field], children) }),
});
export const widenChildren = (childToParent, children) => {
    if (children == undefined)
        return {};
    const result = {};
    Object.keys(children).forEach(key => {
        if (key == "Core" || key == "Template" || key == "Coroutine")
            return;
        // Fun<BasicUpdater<child[key]>, Updater<child>>
        const fieldOfChildUpdater = children[key];
        result[key] = Fun(_ => childToParent(fieldOfChildUpdater(_)));
        if (Object.keys(fieldOfChildUpdater).includes("children")) {
            result[key]["children"] = widenChildren(childToParent, fieldOfChildUpdater["children"]);
        }
    });
    const updateBlock = (block) => {
        if (children[block] != undefined) {
            result[block] = widenChildren(childToParent, children[block]);
        }
    };
    updateBlock("Core");
    updateBlock("Template");
    updateBlock("Coroutines");
    return result;
};
//# sourceMappingURL=state.js.map