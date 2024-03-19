import { simpleUpdater } from "../../../../../Shared/widgets-library/widgets-main";
import { AsyncState } from "../../state/async";

export type AsyncOperation<T> = {
  shouldRun: boolean;
  result: AsyncState<T>;
};
export const AsyncOperation = <T>() => ({
  Default: (shouldRun = false): AsyncOperation<T> => ({
    shouldRun,
    result: AsyncState.Default.unloaded(),
  }),
  Updaters: {
    ...simpleUpdater<AsyncOperation<T>>()("shouldRun"),
    ...simpleUpdater<AsyncOperation<T>>()("result"),
  },
});
