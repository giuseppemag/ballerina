import { Unit } from "../core/fun/domains/unit/state";
import { Template } from "../core/template/state";
import { UncleCoroutinesRunner } from "./coroutines/runner";
import { UncleReadonlyContext, UncleWritableState } from "./state";
import { UncleTable } from "./views/table";

export const UncleTemplate = 
  Template.Default<UncleReadonlyContext, UncleWritableState, Unit>(props =>
    <>
      <UncleTable {...props.context} />
    </>
  ).any([
    UncleCoroutinesRunner.mapContext(_ => ({..._, events:[]}))
  ])
