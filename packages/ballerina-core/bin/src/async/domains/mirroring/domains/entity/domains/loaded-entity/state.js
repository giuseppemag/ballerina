import { AsyncState } from "../../../../../../state";
export const LoadedEntity = {
    Default: {
        fromEntity: (e) => ({
            value: AsyncState.Operations.hasValue(e.value.value.sync) ? e.value.value.sync.value : undefined,
            isSubmitting: AsyncState.Operations.isLoading(e.value.sync),
            isReloading: AsyncState.Operations.isLoading(e.value.value.sync),
            synchronizationErrors: [...AsyncState.Operations.errors(e.value.sync), ...AsyncState.Operations.errors(e.value.value.sync)],
        })
    }
};
//# sourceMappingURL=state.js.map