import { SmallIdentifiable } from "@core";
import { InfiniteStreamState } from "../../../../../../../../infinite-data-stream/state";
import { BaseConfig } from "../base/state";
export type InfiniteEnumConfig<V extends SmallIdentifiable> = {
    kind: "infinite-enum";
    getChunk: InfiniteStreamState<V>["getChunk"];
} & BaseConfig;
export declare const InfiniteEnumConfig: {
    Default: <V extends SmallIdentifiable>(getChunk: InfiniteStreamState<V>["getChunk"], visible?: boolean, disabled?: boolean) => InfiniteEnumConfig<V>;
};
//# sourceMappingURL=state.d.ts.map