import { BaseConfig } from "../base/state";

export type DateConfig = { kind: "date"; } & BaseConfig;
export const DateConfig = {
  Default: (visible?: boolean, disabled?: boolean): DateConfig => ({ kind: "date", ...(BaseConfig.Default(visible, disabled)) })
};
