import {
  simpleUpdater,
  Unit,
} from "../../../../Shared/widgets-library/widgets-main";
import { AsyncState } from "./async";

export type DeleteAsyncState = {
  deleteRequested: boolean;
  api: AsyncState<Unit>;
};
export const DeleteAsyncState = {
  Default: (): DeleteAsyncState => ({
    deleteRequested: false,
    api: AsyncState.Default.unloaded(),
  }),
  Updaters: {
    ...simpleUpdater<DeleteAsyncState>()("deleteRequested"),
    ...simpleUpdater<DeleteAsyncState>()("api"),
  },
};
