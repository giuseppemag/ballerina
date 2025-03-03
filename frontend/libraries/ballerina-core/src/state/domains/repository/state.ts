import { ForeignMutationsInput } from "../../../foreignMutations/state";
import { Unit } from "../../../fun/domains/unit/state";
import { BasicFun } from "../../../fun/state";

export type Updaters = {
  Core: Unit;
  Template: Unit;
  Coroutine: Unit;
};

export type Repository<
  Context,
  State,
  Input,
  ActualUpdaters extends Updaters,
  Operations = Unit,
> = {
  Default: BasicFun<Input, State>;
  Updaters: ActualUpdaters;
  Operations: Operations;
  ForeignMutations: BasicFun<ForeignMutationsInput<Context, State>, Unit>;
};
