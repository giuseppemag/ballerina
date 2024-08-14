import { FormInput } from "./simple-inputs/base";
export type FieldViews = {
    string: FormInput<string>;
    number: FormInput<number>;
    boolean: FormInput<boolean>;
    date: FormInput<Date>;
};
export declare const FieldViews: {
    Default: {
        simple: () => FieldViews;
    };
};
//# sourceMappingURL=field-views.d.ts.map