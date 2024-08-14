import { SmallIdentifiable } from "@core";
import { NumberConfig } from "./domains/number/state";
import { StringConfig } from "./domains/string/state";
import { BooleanConfig } from "./domains/boolean/state";
import { DateConfig } from "./domains/date/state";
import { EnumConfig } from "./domains/enum/state";
import { InfiniteEnumConfig } from "./domains/infinite-enum/state";
import { CustomTypeConfig } from "./domains/custom/state";
export type FieldDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k extends keyof E, Context> = k extends keyof CustomTypeFields ? CustomTypeConfig<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k, Context> : k extends EnumKeys ? EnumConfig<E[k]> : k extends InfiniteEnumKeys ? E[k] extends SmallIdentifiable ? InfiniteEnumConfig<E[k]> : {
    kind: "error - infinite enum requires 'extends Identifiable'";
} : E[k] extends number ? NumberConfig : E[k] extends string ? StringConfig : E[k] extends string ? StringConfig : E[k] extends boolean ? BooleanConfig : E[k] extends Date ? DateConfig : {
    kind: "error - type not supported ";
};
//# sourceMappingURL=state.d.ts.map