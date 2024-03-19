import { CombinatorExpression } from "./domains/combinator-expression/state";
import { ComparisonExpression } from "./domains/comparison/state";

/**************** EXPRESSION ****************/

export type BooleanExpression = CombinatorExpression | ComparisonExpression;
