import { Co } from "./builder";
import { Child2Animation } from "./animation";
import { Child2ForeignMutations } from "../state";


export const Child2CoroutinesRunner = Co.Template<Child2ForeignMutations>(
  Child2Animation
);
