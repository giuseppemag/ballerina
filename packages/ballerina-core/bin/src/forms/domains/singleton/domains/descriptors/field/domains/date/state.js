import { BaseConfig } from "../base/state";
export const DateConfig = {
    Default: (visible, disabled) => (Object.assign({ kind: "date" }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map