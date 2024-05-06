import { Co } from "./builder";
import { animateValues } from "./animateValues";
import { Child1ForeignMutationsExpected } from "../state";


export const Child1CoroutinesRunner = Co.Template<Child1ForeignMutationsExpected>(
  animateValues
);
