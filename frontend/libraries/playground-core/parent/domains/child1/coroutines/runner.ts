import { Co } from "./builder";
import { animateValues } from "./animateValues";
import { Child1, Child1ForeignMutationsExpected, Child1View } from "../state";
import { Template } from "ballerina-core";

export const Child1CoroutinesRunner: Template<
  Child1,
  Child1,
  Child1ForeignMutationsExpected
> = Co.Template<Child1ForeignMutationsExpected>(animateValues);
