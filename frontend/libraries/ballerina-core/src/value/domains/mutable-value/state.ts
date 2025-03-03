import { SimpleCallback } from "ballerina-core";
import { Value } from "../../state";

export type MutableValue<v> = Value<v> & {
  onChange: SimpleCallback<v>;
};

export const MutableValue = {
  Default: <v>(v: v, onChange: SimpleCallback<v>): MutableValue<v> => ({
    ...Value.Default(v),
    onChange,
  }),
};
