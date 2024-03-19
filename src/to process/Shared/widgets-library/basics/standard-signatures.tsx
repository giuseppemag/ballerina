import { BasicFun as BasicFun, BasicUpdater as BasicUpdater } from "./fun";
import { Sum } from "./sum";
import { IOWidget } from "./widget";

export const applyDoubleUpdater = <outerState, innerState, containerState>(
  updaters: Sum<BasicUpdater<outerState>, BasicUpdater<innerState>>,
  outerUpdater: BasicFun<
    BasicUpdater<outerState>,
    BasicUpdater<containerState>
  >,
  innerUpdater: BasicFun<BasicUpdater<innerState>, BasicUpdater<containerState>>
): BasicUpdater<containerState> =>
  Sum.Updaters.Visit<
    BasicUpdater<outerState>,
    BasicUpdater<innerState>,
    BasicUpdater<containerState>
  >(
    (l) => outerUpdater(l),
    (r) => innerUpdater(r)
  )(updaters);

export const applyDoubleUpdaterCurried = <
  outerState,
  innerState,
  containerState,
>(
  outerUpdater: BasicFun<
    BasicUpdater<outerState>,
    BasicUpdater<containerState>
  >,
  innerUpdater: BasicFun<BasicUpdater<innerState>, BasicUpdater<containerState>>
): BasicFun<
  Sum<BasicUpdater<outerState>, BasicUpdater<innerState>>,
  BasicUpdater<containerState>
> =>
  Sum.Updaters.Visit<
    BasicUpdater<outerState>,
    BasicUpdater<innerState>,
    BasicUpdater<containerState>
  >(
    (l) => outerUpdater(l),
    (r) => innerUpdater(r)
  );

export type DoubleUpdater<outerState, innerState> = Sum<
  BasicUpdater<outerState>,
  BasicUpdater<innerState>
>;
export type EventfulUpdater<state, event> = Sum<BasicUpdater<state>, event>;

export type StandardLocalGlobalWidget<outerState, innerState> = IOWidget<
  [outerState, innerState],
  DoubleUpdater<outerState, innerState>
>;

export type StandardLocalWidget<s> = IOWidget<s, BasicUpdater<s>>;
export type StandardIOWidget<r, s> = IOWidget<[r, s], BasicUpdater<s>>;
export type StandardIOWidgetWithEvents<r, s, e> = IOWidget<
  [r, s],
  EventfulUpdater<s, e>
>;
export type StandardWidgetWithEvents<s, e> = IOWidget<s, EventfulUpdater<s, e>>;
