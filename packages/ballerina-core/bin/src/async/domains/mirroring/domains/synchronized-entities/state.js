import { simpleUpdater } from "@core";
export const SynchronizedEntities = () => ({
    Updaters: {
        Core: Object.assign(Object.assign({}, simpleUpdater()("singletons")), simpleUpdater()("collections"))
    }
});
//# sourceMappingURL=state.js.map