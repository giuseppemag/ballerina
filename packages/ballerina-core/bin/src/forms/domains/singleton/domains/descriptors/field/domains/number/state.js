import { BaseConfig } from "../base/state";
export const NumberConfig = {
    Default: (visible, disabled) => (Object.assign({ kind: "number" }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map