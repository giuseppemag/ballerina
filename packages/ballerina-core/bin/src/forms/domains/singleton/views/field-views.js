import { SimpleBooleanInput } from "./simple-inputs/boolean";
import { SimpleDateInput } from "./simple-inputs/date";
import { SimpleNumberInput } from "./simple-inputs/number";
import { SimpleStringInput } from "./simple-inputs/string";
export const FieldViews = {
    Default: {
        simple: () => ({
            string: SimpleStringInput,
            number: SimpleNumberInput,
            boolean: SimpleBooleanInput,
            date: SimpleDateInput,
        })
    }
};
//# sourceMappingURL=field-views.js.map