import { OrderedMap } from "immutable";
import { Guid } from "../../../../../../../Shared/Entity/Guid";
import { CombinationOperation } from "../../../../../../../api/model";
import { VariableLookup, ValueExpression } from "../../../../../tasks/domains/table/domains/rows/domains/valueExpression/state";
import { ValueComparisonOp } from "../partial/domains/boolean-expression/comparison-operator/state";
import { Identifiable } from "../../../../../../../Shared/Entity/Identifiable";

export type ValidBooleanExpression = ValidCombinatorExpression |
  ValidComparisonExpression;

export type ValidCombinatorExpression = Identifiable & {
  kind: CombinationOperation;
  args: OrderedMap<ValidBooleanExpression["Id"], ValidBooleanExpression>;
};

export const ValidCombinatorExpression = {
  Default: (
    Id: Guid,
    init?: ValidBooleanExpression
  ): ValidCombinatorExpression => ({
    Id,
    kind: CombinationOperation.and,
    args: init ? OrderedMap({ [init.Id]: init }) : OrderedMap(),
  }),
};

export type ValidComparisonExpression = Identifiable & {
  kind: ValueComparisonOp["Id"];
  args: [VariableLookup, ValueExpression];
};
