import {
  Child2,
  Child2ForeignMutationsExpected,
  Child2View,
} from "./domains/child2/state";
import {
  Child1,
  Child1ForeignMutationsExpected,
  Child1View,
} from "./domains/child1/state";
import {
  BasicFun,
  BasicUpdater,
  Fun,
  Template,
  View,
  simpleUpdater,
} from "ballerina-core";
import { Updater } from "ballerina-core";
import { replaceWith } from "ballerina-core";
import { Unit } from "ballerina-core";
import { ForeignMutationsInput } from "ballerina-core";
import { Debounced } from "ballerina-core";
import { Value } from "ballerina-core";
import { Synchronized } from "ballerina-core";
import { ValidationResult } from "ballerina-core";

export type Parent = {
  child1: Child1;
  child2: Child2;
  counter: number;
  doubleCounter: number;
  inputString: Debounced<Synchronized<Value<string>, ValidationResult>>;
};

const CoreUpdaters = {
  ...simpleUpdater<Parent>()("child1"),
  ...simpleUpdater<Parent>()("child2"),
  ...simpleUpdater<Parent>()("counter"),
  ...simpleUpdater<Parent>()("doubleCounter"),
  ...simpleUpdater<Parent>()("inputString"),
};

export const Parent = {
  Default: (): Parent => ({
    child1: Child1.Default(),
    child2: Child2.Default(),
    counter: 0,
    doubleCounter: 0,
    inputString: Debounced.Default(Synchronized.Default(Value.Default(""))),
  }),
  Updaters: {
    Core: CoreUpdaters,
    Template: {
      inputString: Fun(Value.Updaters.value<string>).then(
        Fun(Synchronized.Updaters.value<Value<string>, ValidationResult>).then(
          Fun(
            Debounced.Updaters.Template.value<
              Synchronized<Value<string>, ValidationResult>
            >,
          ).then(CoreUpdaters.inputString),
        ),
      ),
      tick: (): Updater<Parent> =>
        CoreUpdaters.counter((_) => _ + 1).then((p) =>
          CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p),
        ),
      doubleTick: (): Updater<Parent> =>
        CoreUpdaters.counter((_) => _ + 2).then((p) =>
          CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p),
        ),
    },
    Coroutine: {
      tick: (): Updater<Parent> => Parent.Updaters.Template.tick(),
      doubleTick: (): Updater<Parent> => Parent.Updaters.Template.doubleTick(),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<ParentReadonlyContext, ParentWritableState>,
  ) => ({}),
};

export type ParentViewProps = {
  context: ParentReadonlyContext & ParentWritableState;
  setState: BasicFun<BasicUpdater<Parent>, void>;
  foreignMutations: ParentForeignMutationsExpected;
};
export type ParentReadonlyContext = Unit;
export type ParentWritableState = Parent;
export type ParentForeignMutationsExpected = Child1ForeignMutationsExpected &
  Child2ForeignMutationsExpected;
export type ParentForeignMutationsExposed = ReturnType<
  typeof Parent.ForeignMutations
>;
export type ParentView1 = View<
  ParentReadonlyContext & ParentWritableState,
  ParentWritableState,
  ParentForeignMutationsExpected,
  {
    Child2: Template<
      ParentReadonlyContext & ParentWritableState,
      ParentWritableState,
      Child2ForeignMutationsExpected,
      Child2View
    >;
  }
>;

export type ParentView2 = View<
  ParentReadonlyContext & ParentWritableState,
  ParentWritableState,
  ParentForeignMutationsExpected,
  {
    Child1: Template<
      ParentReadonlyContext & ParentWritableState,
      ParentWritableState,
      Child1ForeignMutationsExpected,
      Child1View
    >;
    Child2: Template<
      ParentReadonlyContext & ParentWritableState,
      ParentWritableState,
      Child2ForeignMutationsExpected,
      Child2View
    >;
  }
>;
