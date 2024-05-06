import { Co } from "./builder";
import { Child2Animation } from "./animation";
import { Child2ForeignMutationsExpected } from "../state";


export const Child2CoroutinesRunner = Co.Template<Child2ForeignMutationsExpected>(
  Child2Animation
);
