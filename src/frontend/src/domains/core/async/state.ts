import { caseUpdater } from "../fun/domains/updater/domains/caseUpdater/state";
import { BasicUpdater, Updater } from "../fun/domains/updater/state";
import { BasicFun, Fun } from "../fun/state";

export type AsyncState<a> = (
  | ((
      | { kind: "unloaded" }
      | { kind: "loading" }
      | { kind: "reloading"; value: a }
      | { kind: "error"; value: any }
    ) & { failedLoadingAttempts: number })
  | { kind: "loaded"; value: a }
) & {
  map: <b>(f: BasicFun<a, b>) => AsyncState<b>;
  getLoadingAttempts: <a>(this: AsyncState<a>) => number;
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
  return this.kind == "loaded" ? 0 : this.failedLoadingAttempts;
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
    error: <a>(value?: any): AsyncState<a> => ({
      kind: "error",
      map,
      value,
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
    unloaded:<a>(_:BasicUpdater<AsyncState<a> & { kind:"unloaded" }>) => caseUpdater<AsyncState<a>>()("unloaded").unloaded(_),
    loading:<a>(_:BasicUpdater<AsyncState<a> & { kind:"loading" }>) => caseUpdater<AsyncState<a>>()("loading").loading(_),
    loaded:<a>(_:BasicUpdater<AsyncState<a> & { kind:"loaded" }>) => caseUpdater<AsyncState<a>>()("loaded").loaded(_),
    error:<a>(_:BasicUpdater<AsyncState<a> & { kind:"error" }>) => caseUpdater<AsyncState<a>>()("error").error(_),
    reloading:<a>(_:BasicUpdater<AsyncState<a> & { kind:"reloading" }>) => caseUpdater<AsyncState<a>>()("reloading").reloading(_),
    failedLoadingAttempts: <a>(updateAttempts: Updater<number>): Updater<AsyncState<a>> =>
      Updater((current) =>
        current.kind == "loaded"
          ? current
          : {
              ...current,
              failedLoadingAttempts: updateAttempts(current.failedLoadingAttempts),
            }
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
    toReloading: <a>(value: a): Updater<AsyncState<a>> =>
      Updater((_) => ({
        kind: "reloading",
        value,
        map,
        getLoadingAttempts,
        failedLoadingAttempts: 0,
      })),
    toError: <a>(value?: any): Updater<AsyncState<a>> =>
      Updater((current) => ({
        kind: "error",
        map,
        value,
        getLoadingAttempts,
        failedLoadingAttempts: current.getLoadingAttempts() + 1,
      })),
    toLoaded: <a>(value: a): Updater<AsyncState<a>> =>
      Updater((_) => ({ kind: "loaded", value, map, getLoadingAttempts })),
  },
  Operations: {
    map: <a, b>(f: BasicFun<a, b>): Fun<AsyncState<a>, AsyncState<b>> =>
      Fun((_) => _.map(f)),
  },
};
