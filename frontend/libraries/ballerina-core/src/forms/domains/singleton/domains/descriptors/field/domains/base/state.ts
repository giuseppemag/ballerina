
export type BaseConfig = { visible: boolean; disabled: boolean; };
export const BaseConfig = {
  Default: (visible?: boolean, disabled?: boolean): BaseConfig => ({ visible: visible ?? true, disabled: disabled ?? false })
};
