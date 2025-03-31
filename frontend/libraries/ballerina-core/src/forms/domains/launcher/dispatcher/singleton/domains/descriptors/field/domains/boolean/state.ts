import { BaseConfig } from "../base/state";

export type BooleanConfig = { kind: "boolean" } & BaseConfig;
export const BooleanConfig = {
  Default: (visible?: boolean, disabled?: boolean): BooleanConfig => ({
    kind: "boolean",
    ...BaseConfig.Default(visible, disabled),
  }),
};
