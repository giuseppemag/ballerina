import { Updater } from "../fun/domains/updater/state";
import { BasicFun, Fun } from "../fun/state";

export type LoadedAsyncState<a> = { kind: "loaded"; value: a };
export type ReloadingAsyncState<a> = { kind: "reloading"; value: a };
export type FailedReloadAsyncState<a> = {
  kind: "failed-reload";
  value: a;
  error: any;
};

export type AsyncState<a> = (
  | ((
      | { kind: "unloaded" }
      | { kind: "loading" }
      | ReloadingAsyncState<a>
      | { kind: "error"; error: any }
    ) & { failedLoadingAttempts: number })
  | LoadedAsyncState<a>
  | FailedReloadAsyncState<a>
) & {
  map: <b>(f: BasicFun<a, b>) => AsyncState<b>;
  getLoadingAttempts: <a>(this: AsyncState<a>) => number;
};

export type HasValueAsyncState<a> = AsyncState<a> & {
  kind: "loaded" | "reloading" | "failed-reload";
};
export type IsLoadingAsyncState<a> = AsyncState<a> & {
  kind: "loading" | "reloading";
};

function map<a, b>(this: AsyncState<a>, f: BasicFun<a, b>): AsyncState<b> {
  return this.kind == "loaded"
    ? AsyncState.Default.loaded(f(this.value))
    : this.kind == "unloaded"
      ? AsyncState.Default.unloaded()
      : this.kind == "error"
        ? AsyncState.Default.error()
        : this.kind == "loading"
          ? AsyncState.Default.loading()
          : AsyncState.Default.reloading(f(this.value));
}

function getLoadingAttempts<a>(this: AsyncState<a>): number {
  return this.kind == "loaded" || this.kind == "failed-reload"
    ? 0
    : this.failedLoadingAttempts;
}

export const AsyncState = {
  Default: {
    unloaded: <a>(): AsyncState<a> => ({
      kind: "unloaded",
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    loading: <a>(): AsyncState<a> => ({
      kind: "loading",
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    reloading: <a>(value: a): AsyncState<a> => ({
      kind: "reloading",
      value,
      map,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    failedReload: <a>(value: a, error?: any): AsyncState<a> => ({
      kind: "failed-reload",
      value,
      error,
      map,
      getLoadingAttempts,
    }),
    error: <a>(value?: any): AsyncState<a> => ({
      kind: "error",
      map,
      error: value,
      getLoadingAttempts,
      failedLoadingAttempts: 0,
    }),
    loaded: <a>(value: a): AsyncState<a> => ({
      kind: "loaded",
      value,
      map,
      getLoadingAttempts,
    }),
  },
  Updaters: {
    failedLoadingAttempts: <a>(
      updateAttempts: Updater<number>,
    ): Updater<AsyncState<a>> =>
      Updater((current) =>
        current.kind == "loaded" || current.kind == "failed-reload"
          ? current
          : {
              ...current,
              failedLoadingAttempts: updateAttempts(
                current.failedLoadingAttempts,
              ),
            },
      ),
    toUnloaded: <a>(): Updater<AsyncState<a>> =>
      Updater((_) => ({
        kind: "unloaded",
        map,
        getLoadingAttempts,
        failedLoadingAttempts: 0,
      })),
    toLoading: <a>(): Updater<AsyncState<a>> =>
      Updater((current) => ({
        kind: "loading",
        map,
        getLoadingAttempts,
        failedLoadingAttempts: current.getLoadingAttempts(),
      })),
    toReloading: <a>(): Updater<AsyncState<a>> =>
      Updater((current) =>
        current.kind == "loaded" || current.kind == "reloading"
          ? AsyncState.Default.reloading(current.value)
          : AsyncState.Updaters.toLoading<a>()(current),
      ),
    toError: <a>(error?: any): Updater<AsyncState<a>> =>
      Updater((current) =>
        AsyncState.Operations.hasValue(current)
          ? {
              kind: "failed-reload",
              value: current.value,
              map,
              error,
              getLoadingAttempts,
              failedLoadingAttempts: current.getLoadingAttempts() + 1,
            }
          : {
              kind: "error",
              map,
              error,
              getLoadingAttempts,
              failedLoadingAttempts: current.getLoadingAttempts() + 1,
            },
      ),
    toLoaded: <a>(value: a): Updater<AsyncState<a>> =>
      Updater((_) => ({ kind: "loaded", value, map, getLoadingAttempts })),
  },
  Operations: {
    map: <a, b>(f: BasicFun<a, b>): Fun<AsyncState<a>, AsyncState<b>> =>
      Fun((_) => _.map(f)),
    status: <a>(_: AsyncState<a>): a | AsyncState<a>["kind"] =>
      _.kind == "loaded" || _.kind == "reloading" ? _.value : _.kind,
    hasValue: <a>(_: AsyncState<a>): _ is HasValueAsyncState<a> =>
      _.kind == "loaded" || _.kind == "reloading" || _.kind == "failed-reload",
    isLoading: <a>(_: AsyncState<a>): _ is IsLoadingAsyncState<a> =>
      _.kind == "loading" || _.kind == "reloading",
    errors: <a>(_: AsyncState<a>): Array<any> =>
      _.kind == "error" ? [_.error] : [],
  },
};
