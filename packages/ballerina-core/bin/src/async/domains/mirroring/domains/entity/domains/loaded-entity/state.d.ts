import { Entity } from "../../state";
export type LoadedEntity<E> = {
    value?: E;
    isSubmitting: boolean;
    isReloading: boolean;
    synchronizationErrors: Array<any>;
};
export declare const LoadedEntity: {
    Default: {
        fromEntity: <E>(e: Entity<E>) => LoadedEntity<E>;
    };
};
//# sourceMappingURL=state.d.ts.map