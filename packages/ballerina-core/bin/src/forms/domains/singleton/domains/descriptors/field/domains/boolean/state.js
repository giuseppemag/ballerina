import { BaseConfig } from "../base/state";
export const BooleanConfig = {
    Default: (visible, disabled) => (Object.assign({ kind: "boolean" }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map