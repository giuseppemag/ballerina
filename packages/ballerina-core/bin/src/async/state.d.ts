import { Updater } from "../fun/domains/updater/state";
import { BasicFun, Fun } from "../fun/state";
export type LoadedAsyncState<a> = {
    kind: "loaded";
    value: a;
};
export type ReloadingAsyncState<a> = {
    kind: "reloading";
    value: a;
};
export type FailedReloadAsyncState<a> = {
    kind: "failed-reload";
    value: a;
    error: any;
};
export type AsyncState<a> = ((({
    kind: "unloaded";
} | {
    kind: "loading";
} | ReloadingAsyncState<a> | {
    kind: "error";
    error: any;
}) & {
    failedLoadingAttempts: number;
}) | LoadedAsyncState<a> | FailedReloadAsyncState<a>) & {
    map: <b>(f: BasicFun<a, b>) => AsyncState<b>;
    getLoadingAttempts: <a>(this: AsyncState<a>) => number;
};
export type HasValueAsyncState<a> = AsyncState<a> & {
    kind: "loaded" | "reloading" | "failed-reload";
};
export type IsLoadingAsyncState<a> = AsyncState<a> & {
    kind: "loading" | "reloading";
};
export declare const AsyncState: {
    Default: {
        unloaded: <a>() => AsyncState<a>;
        loading: <a>() => AsyncState<a>;
        reloading: <a>(value: a) => AsyncState<a>;
        failedReload: <a>(value: a, error?: any) => AsyncState<a>;
        error: <a>(value?: any) => AsyncState<a>;
        loaded: <a>(value: a) => AsyncState<a>;
    };
    Updaters: {
        failedLoadingAttempts: <a>(updateAttempts: Updater<number>) => Updater<AsyncState<a>>;
        toUnloaded: <a>() => Updater<AsyncState<a>>;
        toLoading: <a>() => Updater<AsyncState<a>>;
        toReloading: <a>() => Updater<AsyncState<a>>;
        toError: <a>(error?: any) => Updater<AsyncState<a>>;
        toLoaded: <a>(value: a) => Updater<AsyncState<a>>;
    };
    Operations: {
        map: <a, b>(f: BasicFun<a, b>) => Fun<AsyncState<a>, AsyncState<b>>;
        status: <a>(_: AsyncState<a>) => a | AsyncState<a>["kind"];
        hasValue: <a>(_: AsyncState<a>) => _ is HasValueAsyncState<a>;
        isLoading: <a>(_: AsyncState<a>) => _ is IsLoadingAsyncState<a>;
        errors: <a>(_: AsyncState<a>) => Array<any>;
    };
};
//# sourceMappingURL=state.d.ts.map