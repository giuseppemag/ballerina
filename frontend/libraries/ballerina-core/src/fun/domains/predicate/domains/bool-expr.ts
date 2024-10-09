import { BasicFun } from "../../../state"
import { Predicate } from "../state"

export type BoolExprSerializable<Leaf> =
  {
    kind: "leaf",
    operation: keyof Leaf,
    arguments: Leaf[keyof Leaf]
  } |
  {
    kind: "true"
  } | {
    kind: "false"
  } | {
    kind: "and" | "or",
    operands: [BoolExprSerializable<Leaf>, BoolExprSerializable<Leaf>]
  } | {
    kind: "not",
    operand: BoolExprSerializable<Leaf>
  }

export type LeafPredicatesEvaluators<Leaf, Context> = { [leaf in keyof Leaf]: BasicFun<Leaf[leaf], Predicate<Context>> }
export type BoolExpr<Leaf> =
  ({
    kind: "leaf",
    operation: keyof Leaf,
    arguments: Leaf[keyof Leaf]
  } |
  {
    kind: "true"
  } | {
    kind: "false"
  } | {
    kind: "and" | "or",
    operands: [BoolExpr<Leaf>, BoolExpr<Leaf>]
  } | {
    kind: "not",
    operand: BoolExpr<Leaf>
  }) & ({
    not: () => BoolExpr<Leaf>,
    and: BasicFun<BoolExpr<Leaf>, BoolExpr<Leaf>>,
    or: BasicFun<BoolExpr<Leaf>, BoolExpr<Leaf>>,
    eval: <Context>(evalLeaf: LeafPredicatesEvaluators<Leaf, Context>) => Predicate<Context>
  })

export const BoolExpr = {
  Default: Object.assign(<Leaf>(_: BoolExprSerializable<Leaf>): BoolExpr<Leaf> => {
    return Object.assign(
      _.kind == "and" || _.kind == "or" ?
        ({ kind: _.kind, operands: [BoolExpr.Default(_.operands[0]), BoolExpr.Default(_.operands[1])] as [BoolExpr<Leaf>, BoolExpr<Leaf>] })
        : _.kind == "not" ?
          ({ kind: _.kind, operand: BoolExpr.Default(_.operand) })
          : _.kind == "leaf" ?
            ({ kind: _.kind, operation: _.operation, arguments: _.arguments })
            : _.kind == "true" ?
              ({ kind: _.kind })
              :
              ({ kind: _.kind }),
      {
        not: function (this: BoolExpr<Leaf>): BoolExpr<Leaf> {
          return BoolExpr.Default({
            kind: "not", operand: this
          })
        },
        and: function (this: BoolExpr<Leaf>, other: BoolExpr<Leaf>): BoolExpr<Leaf> {
          return BoolExpr.Default({
            kind: "and", operands: [this, other]
          })
        },
        or: function (this: BoolExpr<Leaf>, other: BoolExpr<Leaf>): BoolExpr<Leaf> {
          return BoolExpr.Default({
            kind: "or", operands: [this, other]
          })
        },
        eval: function <Context>(this: BoolExpr<Leaf>, evalLeaf: { [leaf in keyof Leaf]: BasicFun<Leaf[leaf], Predicate<Context>> }): Predicate<Context> {
          return this.kind == "not" ? this.operand.eval(evalLeaf).not()
            : this.kind == "and" ? this.operands[0].eval(evalLeaf).and(this.operands[1].eval(evalLeaf))
              : this.kind == "or" ? this.operands[0].eval(evalLeaf).or(this.operands[1].eval(evalLeaf))
                : this.kind == "leaf" ? evalLeaf[this.operation](this.arguments)
                  : this.kind == "true" ? Predicate.True()
                    : Predicate.False()
        },
      })
  },
    {
      true: <Leaf>(): BoolExpr<Leaf> => BoolExpr.Default({
        kind: "true"
      }),
      false: <Leaf>(): BoolExpr<Leaf> => BoolExpr.Default({
        kind: "false"
      }),
      leaf: <Leaf>() => <operation extends keyof Leaf>(operation: operation, args: Leaf[operation]): BoolExpr<Leaf> => BoolExpr.Default({
        kind: "leaf",
        operation,
        arguments: args
      }),
    })
}
