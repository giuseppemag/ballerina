import { Updater } from "../../state";
export const caseUpdater = () => (field) => (caseName) => ({
    [caseName]: (caseUpdater) => {
        return Updater(currentEntity => (currentEntity[field].kind == caseName) ?
            (Object.assign(Object.assign({}, currentEntity), { [field]: caseUpdater(currentEntity) }))
            : currentEntity);
    },
});
import { LeftValue, RightValue, Sum } from "../../../../../collections/domains/sum/state";
const Y = Sum();
const X = {
    Default: () => ({ y: Y.Default.left(10) }),
    Updaters: {
        y: Object.assign(Object.assign({}, caseUpdater()("y")("l")), caseUpdater()("y")("r"))
    }
};
const visitor = X.Updaters.y.l(LeftValue.Updaters.value(_ => _ + 1)).then(X.Updaters.y.r(RightValue.Updaters.value(_ => !_)));
console.log(visitor);
//# sourceMappingURL=state.js.map