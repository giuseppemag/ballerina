import { BaseConfig } from "../base/state";
export const EnumConfig = {
    Default: (choices, visible, disabled) => (Object.assign({ kind: "enum", choices }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map