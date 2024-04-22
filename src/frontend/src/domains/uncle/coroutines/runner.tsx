import { Unit } from "../../core/fun/domains/unit/state";
import { Template } from "../../core/template/state";
import { UncleReadonlyContext, UncleWritableState } from "../state";

export const UncleCoroutinesRunner = 
  Template.Default<UncleReadonlyContext & { events: Array<never> }, UncleWritableState, Unit>(props =>
    <>
    </>
  )
