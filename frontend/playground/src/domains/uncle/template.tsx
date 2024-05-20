import { Template } from "ballerina-core";
import { UncleCoroutinesRunner } from "./coroutines/runner";
import { UncleForeignMutationsExpected, UncleReadonlyContext, UncleWritableState } from "./state";
import { UncleTable } from "./views/table";

export const UncleTemplate = 
  Template.Default<UncleReadonlyContext, UncleWritableState, UncleForeignMutationsExpected>(props =>
    <>
      <UncleTable {...props.context} />
    </>
  ).any([
    UncleCoroutinesRunner.mapContext(_ => ({..._, events:[]}))
  ])
