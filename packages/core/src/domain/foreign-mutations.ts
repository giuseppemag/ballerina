import { BasicUpdater } from '../updater/updater'

export type ForeignMutationsInput<Context, State> = {
  context: Context & State
  setState: (updater: BasicUpdater<State>) => void
}
