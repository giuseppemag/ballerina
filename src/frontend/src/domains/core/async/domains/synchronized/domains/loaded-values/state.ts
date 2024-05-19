import { Unit } from "../../../../../fun/domains/unit/state";
import { Synchronized } from "../../state";

export type LoadedValues<T> = {
  [k in keyof T]: T[k] extends Synchronized<Unit, infer v> ? v : never;
};
