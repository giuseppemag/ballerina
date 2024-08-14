import { BaseConfig } from "../base/state";
export const StringConfig = {
    Default: (visible, disabled) => (Object.assign({ kind: "string" }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map