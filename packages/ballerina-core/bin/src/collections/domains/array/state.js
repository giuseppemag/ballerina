import { Fun } from "../../../fun/state";
export const ArrayRepo = {
    Operations: {
        map: (f) => Fun(_ => _.map(f))
    }
};
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
};
//# sourceMappingURL=state.js.map