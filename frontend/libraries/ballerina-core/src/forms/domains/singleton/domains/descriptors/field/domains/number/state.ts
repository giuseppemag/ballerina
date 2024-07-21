import { BaseConfig } from "../base/state";

export type NumberConfig = { kind: "number"; } & BaseConfig;
export const NumberConfig = {
  Default: (visible?: boolean, disabled?: boolean): NumberConfig => ({ kind: "number", ...(BaseConfig.Default(visible, disabled)) })
};

