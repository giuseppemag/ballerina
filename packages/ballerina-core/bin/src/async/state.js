import { Updater } from "../fun/domains/updater/state";
import { Fun } from "../fun/state";
function map(f) {
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
function getLoadingAttempts() {
    return this.kind == "loaded" || this.kind == "failed-reload" ? 0 : this.failedLoadingAttempts;
}
export const AsyncState = {
    Default: {
        unloaded: () => ({
            kind: "unloaded",
            map,
            getLoadingAttempts,
            failedLoadingAttempts: 0,
        }),
        loading: () => ({
            kind: "loading",
            map,
            getLoadingAttempts,
            failedLoadingAttempts: 0,
        }),
        reloading: (value) => ({
            kind: "reloading",
            value,
            map,
            getLoadingAttempts,
            failedLoadingAttempts: 0,
        }),
        failedReload: (value, error) => ({
            kind: "failed-reload",
            value,
            error,
            map,
            getLoadingAttempts,
        }),
        error: (value) => ({
            kind: "error",
            map,
            error: value,
            getLoadingAttempts,
            failedLoadingAttempts: 0,
        }),
        loaded: (value) => ({
            kind: "loaded",
            value,
            map,
            getLoadingAttempts,
        }),
    },
    Updaters: {
        failedLoadingAttempts: (updateAttempts) => Updater((current) => current.kind == "loaded" || current.kind == "failed-reload"
            ? current
            : Object.assign(Object.assign({}, current), { failedLoadingAttempts: updateAttempts(current.failedLoadingAttempts) })),
        toUnloaded: () => Updater((_) => ({
            kind: "unloaded",
            map,
            getLoadingAttempts,
            failedLoadingAttempts: 0,
        })),
        toLoading: () => Updater((current) => ({
            kind: "loading",
            map,
            getLoadingAttempts,
            failedLoadingAttempts: current.getLoadingAttempts(),
        })),
        toReloading: () => Updater((current) => current.kind == "loaded" ?
            AsyncState.Default.reloading(current.value)
            : AsyncState.Updaters.toLoading()(current)),
        toError: (error) => Updater((current) => AsyncState.Operations.hasValue(current) ?
            ({
                kind: "failed-reload",
                value: current.value,
                map,
                error,
                getLoadingAttempts,
                failedLoadingAttempts: current.getLoadingAttempts() + 1,
            }) : ({
            kind: "error",
            map,
            error,
            getLoadingAttempts,
            failedLoadingAttempts: current.getLoadingAttempts() + 1,
        })),
        toLoaded: (value) => Updater((_) => ({ kind: "loaded", value, map, getLoadingAttempts })),
    },
    Operations: {
        map: (f) => Fun((_) => _.map(f)),
        status: (_) => _.kind == "loaded" || _.kind == "reloading" ? _.value : _.kind,
        hasValue: (_) => _.kind == "loaded" || _.kind == "reloading" || _.kind == "failed-reload",
        isLoading: (_) => _.kind == "loading" || _.kind == "reloading",
        errors: (_) => _.kind == "error" ? [_.error] : [],
    },
};
//# sourceMappingURL=state.js.map