
/**************** COMPARISON EXPRESSION ****************/

import { Guid } from "../../../../../../../../../../../Shared/Entity/Guid";
import { Identifiable } from "../../../../../../../../../../../Shared/Entity/Identifiable";
import { simpleUpdater, Updater } from "../../../../../../../../../../../Shared/widgets-library/widgets-main";
import { FilterOperation } from "../../../../../../../../../../../api/model";
import { VariableLookup, ValueExpression } from "../../../../../../../../../tasks/domains/table/domains/rows/domains/valueExpression/state";
import { BooleanExpression } from "../../state";
import { ValueComparisonOp } from "../comparison-operator/state";

export type ComparisonExpression = Identifiable & {
  kind: ValueComparisonOp["Id"] | undefined;
  args: [VariableLookup | undefined, ValueExpression | undefined];
  // This is the partial comparison expression, which can be incomplete at multiple levels because it is still being edited. 
  // We need the userInput to store what the user is typing while it cannot be converted to a ValueExpression
  userInput: string;
};

export const ComparisonExpression = ({
  Default: (Id: Guid, arg1?: VariableLookup): ComparisonExpression => ({
    Id,
    kind: undefined,
    args: [arg1, undefined],
    userInput: ""
  }),
  Updaters: {
    ...simpleUpdater<ComparisonExpression>()("kind"),
    leftOperand: (
      updater: Updater<VariableLookup | undefined>
    ): Updater<ComparisonExpression> => Updater((current) => ({
      ...current,
      args: [updater(current.args[0]), current.args[1]],
    })),
    rightOperant: (
      updater: Updater<ValueExpression | undefined>
    ): Updater<ComparisonExpression> => Updater((current) => ({
      ...current,
      args: [current.args[0], updater(current.args[1])],
    })),
  },
  Operations: {
    validateFilter: (filter: ComparisonExpression) => {
      return Boolean(filter.kind && !filter.args.some((_) => _ == undefined));
    },
  },
});

export function isComparisonExpression(
  exp: BooleanExpression
): exp is ComparisonExpression {
  return Boolean(!exp.kind || exp.kind in FilterOperation);
}
