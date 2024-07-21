import { Template } from "ballerina-core";
import { UncleCoroutinesRunner } from "./coroutines/runner";
import { UncleForeignMutationsExpected, UncleReadonlyContext, UncleView, UncleWritableState } from "./state";

export const UncleTemplate = 
  Template.Default<UncleReadonlyContext, UncleWritableState, UncleForeignMutationsExpected, UncleView>(props =>
   <props.view {...props} />
  ).any([
    UncleCoroutinesRunner.mapContext(_ => ({..._, events:[]}))
  ])
