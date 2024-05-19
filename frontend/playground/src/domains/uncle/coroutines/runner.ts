import { UncleForeignMutationsExpected } from "../state";
import { Co } from "./builder";

export const UncleCoroutinesRunner = 
  Co.Template<UncleForeignMutationsExpected>(Co.Seq([]), { runFilter:props => false})
