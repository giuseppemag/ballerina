import { DragEndEvent } from "@dnd-kit/core";
import { OrderedMap, Set } from "immutable";
import { v4 } from "uuid";
import { Identifiable } from "../../../../../../../../../../../Shared/Entity/Identifiable";
import { Guid } from "../../../../../../../../../../../Shared/Entity/Guid";
import { simpleUpdater, Updater, BasicFun, BasicUpdater } from "../../../../../../../../../../../Shared/widgets-library/widgets-main";
import { CombinationOperation, FilterGroup } from "../../../../../../../../../../../api/model";
import { ComparisonExpression, isComparisonExpression } from "../comparison/state";
import { BooleanExpression } from "../../state";
import { isCombinatorExpression } from "./state";
import { VariableLookup, Variable, ValueExpression } from "../../../../../../../../../tasks/domains/table/domains/rows/domains/valueExpression/state";
import { OrderedMapRepo } from "../../../../../../../map/state";
import { ValidCombinatorExpression } from "../../../../../validated/state";
import { CombinationOperation } from "../../../../../../../../../../../tables/tables.gen";
import { CombinatorExpression } from "./state";

/**************** COMBINATOR EXPRESSION ****************/

export type CombinatorExpression = Identifiable & {
  kind: CombinationOperation;
  args: OrderedMap<BooleanExpression["Id"], BooleanExpression>;
};
export const CombinatorExpression = {
  Default: (Id: Guid, init?: BooleanExpression): CombinatorExpression => ({
    Id,
    kind: CombinationOperation.and,
    args: init ? OrderedMap({ [init.Id]: init }) : OrderedMap(),
  }),
  Updaters: {
    ...simpleUpdater<CombinatorExpression>()("kind"),
    ...simpleUpdater<CombinatorExpression>()("args"),
    addFilterGroup: (Id: Guid): Updater<CombinatorExpression> => Updater((prev) => ({
      ...prev,
      args: prev.args?.set(
        Id,
        CombinatorExpression.Default(Id, ComparisonExpression.Default(v4()))
      ),
    })),
    addFilter: (
      Id: Guid,
      arg1?: VariableLookup
    ): Updater<CombinatorExpression> => Updater((prev) => ({
      ...prev,
      args: prev.args?.set(Id, ComparisonExpression.Default(Id, arg1)),
    })),
    dragAndDrop: (
      dragId: string,
      dropId: string | undefined
    ): Updater<CombinatorExpression> => Updater((prev) => {
      if (!CombinatorExpression.Operations.isValidDrop(dragId, dropId, prev))
        return prev;
      const drag = CombinatorExpression.Operations.findBooleanExpression(
        prev,
        dragId
      );

      if (drag && dropId) {
        return CombinatorExpression.Operations.findAndConcatExpression(
          CombinatorExpression.Operations.deleteExpressions([drag.Id])(prev),
          dropId,
          drag
        );
      }

      return prev;
    }),

    arg: (
      argId: BooleanExpression["Id"]
    ): BasicFun<Updater<BooleanExpression>, Updater<CombinatorExpression>> => (argUpdater) => {
      return Updater((current) => !current.args.has(argId)
        ? current
        : CombinatorExpression.Updaters.args((current) => current.set(argId, argUpdater(current.get(argId)!))
        )(current)
      );
    },
  },
  Operations: {
    findBooleanExpression: (
      expression: BooleanExpression,
      targetId: Guid
    ): BooleanExpression | undefined => {
      if (expression.Id === targetId) {
        return expression;
      } else if (isCombinatorExpression(expression)) {
        for (const arg of expression.args.valueSeq().toArray()) {
          const found = CombinatorExpression.Operations.findBooleanExpression(
            arg,
            targetId
          );
          if (found) return found;
        }
      }
    },
    deleteExpressions: (targetIds: Guid[]): Updater<CombinatorExpression> => {
      return Updater((expression) => ({
        ...expression,
        args: expression.args
          .filter((arg) => !targetIds.includes(arg.Id))
          .map((arg) => isCombinatorExpression(arg)
            ? CombinatorExpression.Operations.deleteExpressions(targetIds)(
              arg
            )
            : arg
          ),
      }));
    },
    findAndConcatExpression: (
      expression: CombinatorExpression,
      targetId: Guid,
      concatExpression: BooleanExpression
    ): CombinatorExpression => {
      if (expression.Id === targetId) {
        return {
          ...expression,
          args: expression.args.set(concatExpression.Id, concatExpression),
        };
      }

      return {
        ...expression,
        args: expression.args.map((arg) => {
          if (isCombinatorExpression(arg)) {
            return CombinatorExpression.Operations.findAndConcatExpression(
              arg,
              targetId,
              concatExpression
            );
          } else {
            return arg;
          }
        }),
      };
    },
    isValidDrop: (
      dragId: string | undefined,
      dropId: string | undefined,
      expression: BooleanExpression
    ): boolean => {
      if (!dragId || !dropId) return false;

      const drag = CombinatorExpression.Operations.findBooleanExpression(
        expression,
        dragId
      );

      const drop = CombinatorExpression.Operations.findBooleanExpression(
        expression,
        dropId
      );

      if ((drag &&
        CombinatorExpression.Operations.traverseIds(drag).has(dropId)) ||
        (drop && CombinatorExpression.Operations.immediateIds(drop).has(dragId))) {
        return false;
      }

      return true;
    },
    validateCombinatorExpression: (expression: CombinatorExpression) => {
      return Boolean(expression.kind && expression.args?.size);
    },
    fromFilterGroup: (
      filterGroup: FilterGroup,
      scope: OrderedMap<Variable["Id"], Variable>
    ): CombinatorExpression => {
      const partialBooleanExpressions: Array<BooleanExpression> = [];

      filterGroup.filters?.forEach((filter) => {
        // todo: console.warn - error warning
        const variableType = scope.get(filter.name)?.type;
        if (variableType) {
          const partialComparisonExpression: ComparisonExpression = {
            Id: v4(),
            kind: filter.op,
            args: [
              { kind: "variable-lookup", variableId: filter.name },
              ValueExpression.Operations.fromFilterValue(variableType)(
                filter.value.value
              ),
            ],
            userInput: ""
          };

          partialBooleanExpressions.push(partialComparisonExpression);
        }
      });

      filterGroup.filterGroups?.forEach((nestedFilterGroup) => {
        const nestedExpression = CombinatorExpression.Operations.fromFilterGroup(
          nestedFilterGroup,
          scope
        );
        partialBooleanExpressions.push(nestedExpression);
      });

      const partialCombinatorExpression: CombinatorExpression = {
        Id: v4(),
        kind: filterGroup.op,
        args: OrderedMapRepo.Default.fromIdentifiables(
          partialBooleanExpressions
        ),
      };

      return partialCombinatorExpression;
    },
    validateExpression: (
      expression: CombinatorExpression
    ): ValidCombinatorExpression | "error" => {
      for (const arg of expression.args.valueSeq().toArray()) {
        if (isCombinatorExpression(arg)) {
          if (CombinatorExpression.Operations.validateExpression(arg) === "error") {
            return "error";
          }
        } else if (!ComparisonExpression.Operations.validateFilter(arg)) {
          return "error";
        }
      }

      return expression as ValidCombinatorExpression;
    },
    traverseAndFindByVariableIds: (
      expression: BooleanExpression,
      variableIds: Immutable.Set<Variable["Id"]>
    ): Set<ComparisonExpression> => {
      let result = Set<ComparisonExpression>();
      variableIds.forEach((variableId) => {
        if (isComparisonExpression(expression) &&
          expression.args[0]?.variableId === variableId) {
          result = result.add(expression);
        } else if (isCombinatorExpression(expression)) {
          expression.args.forEach((arg) => {
            result = result.union(
              CombinatorExpression.Operations.traverseAndFindByVariableIds(
                arg,
                Set([variableId])
              )
            );
          });
        }
      });
      return result;
    },
    traverseIds: (expression: BooleanExpression): Set<Guid> => {
      let result = Set<Guid>();
      result = result.add(expression.Id);
      if (isCombinatorExpression(expression)) {
        expression.args.forEach((arg) => {
          result = result.union(
            CombinatorExpression.Operations.traverseIds(arg)
          );
        });
      }
      return result;
    },
    immediateIds: (expression: BooleanExpression): Set<Guid> => {
      let result: Set<Guid> = Set();
      if (isCombinatorExpression(expression)) {
        expression.args.forEach((arg) => {
          result = result.add(arg.Id);
        });
      }
      return result;
    },
    isAdvancedExpression: (expression: CombinatorExpression): boolean => {
      return expression.args
        .valueSeq()
        .toArray()
        .some((exp) => isCombinatorExpression(exp));
    },
  },
  ForeignCombinatorMutations: (
    _state: CombinatorExpression,
    _setState: BasicFun<BasicUpdater<CombinatorExpression>, void>
  ) => ({
    breakFilterGroup: (Id: Variable["Id"]) => {
      _setState(
        Updater((prev) => {
          const map = prev.args.get(Id);
          if (map && isCombinatorExpression(map)) {
            return {
              ...prev,
              args: OrderedMapRepo.Updaters.replaceAndMerge(
                Id,
                prev.args,
                map.args
              ),
            };
          } else {
            return prev;
          }
        })
      );
    },
    deleteArg: (Id: Variable["Id"]) => {
      _setState((prev) => ({ ...prev, args: prev.args.remove(Id) }));
    },
    onDragEnd: ({ active, over }: DragEndEvent) => {
      _setState(
        CombinatorExpression.Updaters.dragAndDrop(
          active.id.toString(),
          over?.id.toString()
        )
      );
    },
  }),
  ForeignComparisonMutations: (
    _state: CombinatorExpression,
    _setState: BasicFun<BasicUpdater<CombinatorExpression>, void>
  ) => ({
    deleteArg: (Id: Variable["Id"]) => {
      _setState((prev) => ({
        ...prev,
        args: prev.args?.remove(Id),
      }));
    },
    convertToFilterGroup: (Id: Variable["Id"]) => {
      _setState((prev) => ({
        ...prev,
        args: prev.args?.updateIn([Id], (expr) => {
          const typedExpr = expr as BooleanExpression;
          return CombinatorExpression.Default(typedExpr.Id, typedExpr);
        }),
      }));
    },
  }),
};export function isCombinatorExpression(
  exp: BooleanExpression
): exp is CombinatorExpression {
  return Boolean(exp.kind && exp.kind in CombinationOperation);
}

