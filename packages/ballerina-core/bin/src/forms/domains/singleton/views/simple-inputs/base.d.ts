import { SimpleCallback } from "@core";
import { BasicFun } from "../../../../../fun/state";
export type FormInput<T> = BasicFun<{
    value: T;
    onChange: SimpleCallback<T>;
}, JSX.Element>;
//# sourceMappingURL=base.d.ts.map