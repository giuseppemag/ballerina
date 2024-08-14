import { SimpleCallback, BasicUpdater } from "@core";
import { SingletonFormWritableState } from "../../../../../state";
import { BaseConfig } from "../base/state";
export type CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k extends (keyof E) & (keyof CustomTypeFields), Context> = {
    kind: "custom";
    k: k;
    render: (props: {
        context: Context;
        state: CustomTypeFields[k];
        entityValue: E;
        fieldValue: E[k];
        onChange: SimpleCallback<E[k]>;
        setState: SimpleCallback<BasicUpdater<SingletonFormWritableState<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields>>>;
    }) => JSX.Element;
} & BaseConfig;
export declare const CustomTypeConfig: {
    Default: <E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k extends (keyof E) & (keyof CustomTypeFields), Context>(k: k, render: CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k, Context>["render"], visible?: boolean, disabled?: boolean) => CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k, Context>;
};
//# sourceMappingURL=state.d.ts.map