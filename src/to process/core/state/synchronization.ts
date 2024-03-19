import {
  simpleUpdater,
  Unit,
} from "../../../../Shared/widgets-library/widgets-main";
import { AsyncState } from "./async";

export type SynchronizationState = {
  dirty: boolean;
  lastModified: number;
  api: AsyncState<Unit>;
};

export const SynchronizationState = {
  Default: (): SynchronizationState => ({
    dirty: false,
    lastModified: 0,
    api: AsyncState.Default.unloaded(),
  }),
  Updaters: {
    ...simpleUpdater<SynchronizationState>()("dirty"),
    ...simpleUpdater<SynchronizationState>()("lastModified"),
    ...simpleUpdater<SynchronizationState>()("api"),
  },
};
