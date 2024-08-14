import { BaseConfig } from "../base/state";
export const InfiniteEnumConfig = {
    Default: (getChunk, visible, disabled) => (Object.assign({ kind: "infinite-enum", getChunk }, (BaseConfig.Default(visible, disabled))))
};
//# sourceMappingURL=state.js.map