import { SmallIdentifiable } from "../../../../../../../../../main";
import { BaseConfig } from "../base/state";

export type EnumConfig<V> = {
  kind: "enum";
  choices: Array<SmallIdentifiable & { displayName: string; value: V }>;
} & BaseConfig;
export const EnumConfig = {
  Default: <V>(
    choices: EnumConfig<V>["choices"],
    visible?: boolean,
    disabled?: boolean,
  ): EnumConfig<V> => ({
    kind: "enum",
    choices,
    ...BaseConfig.Default(visible, disabled),
  }),
};
