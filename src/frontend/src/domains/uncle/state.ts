import { ForeignMutationsInput } from "../core/foreignMutations/state"
import { Unit } from "../core/fun/domains/unit/state"
import { replaceWith } from "../core/fun/domains/updater/domains/replaceWith/state"
import { simpleUpdater } from "../core/fun/domains/updater/domains/simpleUpdater/state"

export type Uncle = {
  flag:boolean
}

export const Uncle = {
  Default:() : Uncle => ({
    flag:false
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<Uncle>()("flag")
    }
  },
  ForeignMutations:(_:ForeignMutationsInput<UncleReadonlyContext, UncleWritableState>) => ({
    overrideFlag:(newValue:boolean) =>
      _.setState(Uncle.Updaters.Core.flag(replaceWith(newValue)))
  })
}

export type UncleWritableState = Uncle
export type UncleReadonlyContext = Unit
export type UncleForeignMutationsExpected = Unit
export type UncleForeignMutationsExposed = ReturnType<typeof  Uncle.ForeignMutations>
