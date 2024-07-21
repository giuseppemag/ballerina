import { FormInput } from "./simple-inputs/base";
import { SimpleBooleanInput } from "./simple-inputs/boolean";
import { SimpleDateInput } from "./simple-inputs/date";
import { SimpleNumberInput } from "./simple-inputs/number";
import { SimpleStringInput } from "./simple-inputs/string";


export type FieldViews = {
  string: FormInput<string>;
  number: FormInput<number>;
  boolean: FormInput<boolean>;
  date: FormInput<Date>;
};
export const FieldViews = {
  Default: {
    simple: (): FieldViews => ({
      string: SimpleStringInput,
      number: SimpleNumberInput,
      boolean: SimpleBooleanInput,
      date: SimpleDateInput,
    })
  }
};
