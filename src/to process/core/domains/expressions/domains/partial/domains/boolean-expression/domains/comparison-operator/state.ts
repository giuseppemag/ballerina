import { TFunction } from "i18next";
import { Map } from "immutable";
import { Identifiable } from "../../../../../../../../../../Shared/Entity/Identifiable";
import { FilterOperation } from "../../../../../../../../../../tables/tables.gen";
import { MapRepo } from "../../../../../../map/state";

/**************** VALUE COMPARISON OP ****************/

export type ValueComparisonOp = Identifiable & { displayName: string; };
export const ValueComparisonOp = {
  Default: (op: FilterOperation, t: TFunction): ValueComparisonOp => ({
    Id: op,
    displayName: t("enums:FilterOperation." + op),
  }),
  Operators: {
    fromFilterOperation: (
      ops: FilterOperation[],
      t: TFunction
    ): Map<ValueComparisonOp["Id"], ValueComparisonOp> => {
      return MapRepo.Default.fromIdentifiables(
        ops.map<ValueComparisonOp>((op) => ({
          Id: op,
          displayName: t("enums:FilterOperation." + op),
        }))
      );
    },
  },
};
