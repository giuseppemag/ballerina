import { Map } from "immutable";

import { Guid } from "./Guid";
import { Identifiable } from "./Identifiable";

export const IdentifiablesArrayToMap = <T extends Identifiable>(
  values: Array<T>
): Map<Guid, T> => Map(values.map((_) => [_.Id, _]));
