import { Sum, Value } from "../../../../../../main";
import { CollectionReference } from "../reference/state"

export type CollectionSelection<Element extends CollectionReference> = Sum<Element, "no selection">;
export const CollectionSelection = <Element extends CollectionReference>() => Sum<Element, "no selection">();
