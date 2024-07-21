import { SimpleCallback, BasicUpdater } from "../../../../../../../../../main";
import { SingletonFormWritableState } from "../../../../../state";
import { BaseConfig } from "../base/state";


export type CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k extends keyof E> =
  {
    kind: "custom"; k: k;
    render: (props: {
      value: E[k];
      onChange: SimpleCallback<E[k]>;
      setState: SimpleCallback<BasicUpdater<SingletonFormWritableState<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields>>>;
    }) => JSX.Element;
  } & BaseConfig;
export const CustomTypeConfig = {
  Default: <E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k extends keyof E>(k: k, render: CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k>["render"], visible?: boolean, disabled?: boolean): CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k> => ({ kind: "custom", k, render, visible: visible ?? true, disabled: disabled ?? false })
};
