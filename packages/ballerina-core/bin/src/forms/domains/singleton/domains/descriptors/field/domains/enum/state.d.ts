import { SmallIdentifiable } from "@core";
import { BaseConfig } from "../base/state";
export type EnumConfig<V> = {
    kind: "enum";
    choices: Array<SmallIdentifiable & {
        displayName: string;
        value: V;
    }>;
} & BaseConfig;
export declare const EnumConfig: {
    Default: <V>(choices: EnumConfig<V>["choices"], visible?: boolean, disabled?: boolean) => EnumConfig<V>;
};
//# sourceMappingURL=state.d.ts.map