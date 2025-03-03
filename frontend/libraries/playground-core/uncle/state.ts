import {
  BasicFun,
  BasicUpdater,
  ForeignMutationsInput,
  View,
} from "ballerina-core";
import { Unit } from "ballerina-core";
import { replaceWith } from "ballerina-core";
import { simpleUpdater } from "ballerina-core";

export type Uncle = {
  flag: boolean;
};

export const Uncle = {
  Default: (): Uncle => ({
    flag: false,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Uncle>()("flag"),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<UncleReadonlyContext, UncleWritableState>,
  ) => ({
    overrideFlag: (newValue: boolean) =>
      _.setState(Uncle.Updaters.Core.flag(replaceWith(newValue))),
  }),
};

export type UncleReadonlyContext = Unit;
export type UncleWritableState = Uncle;
export type UncleForeignMutationsExpected = Unit;
export type UncleForeignMutationsExposed = ReturnType<
  typeof Uncle.ForeignMutations
>;
export type UncleView = View<
  UncleReadonlyContext & UncleWritableState,
  UncleWritableState,
  UncleForeignMutationsExpected
>;
