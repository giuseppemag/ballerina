import { BaseConfig } from "../base/state";


export type StringConfig = { kind: "string"; } & BaseConfig;
export const StringConfig = {
  Default: (visible?: boolean, disabled?: boolean): StringConfig => ({ kind: "string", ...(BaseConfig.Default(visible, disabled)) })
};
