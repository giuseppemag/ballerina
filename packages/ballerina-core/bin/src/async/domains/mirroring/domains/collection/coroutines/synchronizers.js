import { CoTypedFactory, AsyncState, replaceWith, Entity, Debounced, unit } from "@core";
import { Fun } from "../../../../../../fun/state";
import { insideEntitySynchronizedAndDebounced } from "../../singleton/coroutines/synchronizers";
import { Collection, CollectionEntity } from "../state";
export const collectionEntityLoader = (synchronizers) => (k, id, narrowing_k, widening_k, dependees) => Object.assign((mutation, mutationArg, entityId) => {
    const Co = CoTypedFactory();
    return Co.GetState().then(current => {
        const entities = narrowing_k(current).entities;
        if (!AsyncState.Operations.hasValue(entities.sync) || !entities.sync.value.get(entityId))
            return Co.Return("completed");
        return synchronizers[k][mutation](mutationArg)
            .embed(_ => {
            const entities = narrowing_k(_).entities;
            if (AsyncState.Operations.hasValue(entities.sync)) {
                const entity = entities.sync.value.get(entityId);
                if (entity != undefined)
                    return (Object.assign(Object.assign({}, _), entity));
            }
            return undefined;
        }, Fun(Collection().Updaters.Core.entity.set(entityId)).then(widening_k)).then(syncResult => Co.All(dependees).then(syncResults => Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")));
    });
}, {
    add: (entityId, entity, position) => {
        const Co = CoTypedFactory();
        const CoColl = CoTypedFactory();
        return CoColl.SetState(Collection().Updaters.Core.entity.add([entityId, entity, position !== null && position !== void 0 ? position : { kind: "at the end" }])).embed(_ => (Object.assign(Object.assign({}, _), (narrowing_k(_)))), widening_k)
            .then(() => synchronizers[k].add(entity).embed(_ => {
            const entities = narrowing_k(_).entities;
            if (AsyncState.Operations.hasValue(entities.sync)) {
                const entity = entities.sync.value.get(entityId);
                if (entity != undefined)
                    return (Object.assign(Object.assign({}, _), (entity)));
            }
            return undefined;
        }, Fun(Collection().Updaters.Core.entity.set(entityId)).then(widening_k))).then(_ => CoColl.GetState().then(current => {
            if (!AsyncState.Operations.hasValue(current.entities.sync))
                return CoColl.Return(unit);
            const syncedEntity = current.entities.sync.value.get(entityId);
            if (!syncedEntity || !AsyncState.Operations.hasValue(syncedEntity.value.value.sync))
                return CoColl.Return(unit);
            if (id(syncedEntity.value.value.sync.value) == entityId)
                return CoColl.Return(unit);
            // otherwise, the id has changed (probably overridden by the API), let's save the new id
            return CoColl.SetState(Collection().Updaters.Core.entity.add([id(syncedEntity.value.value.sync.value), syncedEntity, position !== null && position !== void 0 ? position : { kind: "at the end" }]).then(Collection().Updaters.Core.entity.remove(entityId)));
        }).embed(_ => (Object.assign(Object.assign({}, _), (narrowing_k(_)))), widening_k)
            .then(() => Co.Return(_)));
    },
    remove: (entityId) => {
        const Co = CoTypedFactory();
        const CoColl = CoTypedFactory();
        return CoColl.SetState(
        // Collection<Collections[k]>().Updaters.Core.entity.remove(entityId)
        Collection().Updaters.Core.removed(entityId, replaceWith(true))).embed(_ => (Object.assign(Object.assign({}, _), (narrowing_k(_)))), widening_k)
            .then(() => synchronizers[k].remove(entityId).embed(_ => {
            const entities = narrowing_k(_).entities;
            if (AsyncState.Operations.hasValue(entities.sync)) {
                const entity = entities.sync.value.get(entityId);
                if (entity != undefined)
                    return (Object.assign(Object.assign({}, _), (entity)));
            }
            return undefined;
        }, Fun(Collection().Updaters.Core.entity.set(entityId)).then(widening_k))).then((_) => Co.GetState().then(current => {
            const entities = narrowing_k(current).entities;
            if (!AsyncState.Operations.hasValue(entities.sync))
                return Co.Return("completed");
            const entity = entities.sync.value.get(entityId);
            if (!entity || entity.value.sync.kind == "error")
                return Co.Return("completed");
            return CoColl.SetState(Collection().Updaters.Core.entity.remove(entityId)).embed(_ => (Object.assign(Object.assign({}, _), (narrowing_k(_)))), widening_k)
                .then(() => Co.Return("completed"));
        }));
    },
    reload: () => {
        const Co = CoTypedFactory();
        const CoColl = CoTypedFactory();
        return CoColl.Seq([
            synchronizers[k].reload().embed(_ => (Object.assign(Object.assign({}, _), _.entities)), Collection().Updaters.Core.entities)
        ]).embed(_ => (Object.assign(Object.assign({}, _), (narrowing_k(_)))), widening_k)
            .then(() => Co.Return("completed"));
    },
});
export const collectionDirtySetter = () => (k, narrowing_k, widening_k) => (entityId, dirtyStatus) => {
    const CoEntity = CoTypedFactory();
    const Co = CoTypedFactory();
    return (CoEntity.SetState(CollectionEntity().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Core.dirty(replaceWith(dirtyStatus)))))).embed(_ => {
        const _narrowed = narrowing_k(_);
        const entities = _narrowed.entities;
        if (AsyncState.Operations.hasValue(entities.sync)) {
            const entity = entities.sync.value.get(entityId);
            if (entity != undefined)
                return (Object.assign(Object.assign({}, _), entity));
        }
        return undefined;
    }, Fun(Collection().Updaters.Core.entity.set(entityId)).then(widening_k));
};
export const collectionCheckNotDirty = () => ([id, e]) => {
    var _a;
    return AsyncState.Operations.hasValue(e.entities.sync) && ((_a = e.entities.sync.value.get(id)) === null || _a === void 0 ? void 0 : _a.value.dirty) != "not dirty";
};
export const collectionEntityUpdater = () => (widening_k) => Fun(([id, u]) => widening_k(Collection().Updaters.Template.entityValue(id, u)));
export const collectionSynchronizationContext = (entityDescriptors) => {
    let synchronizers = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        synchronizers[k] = {};
        Object.keys(entityDescriptors[k]).forEach(field => {
            // only update the mutation fields of the entity descriptor
            if (field != "entityName" && field != "narrowing" && field != "widening" && field != "dependees" && field != "add" && field != "remove" && field != "default" && field != "reload" && field != "reloadElement")
                synchronizers[k][field] = (mutationArg) => {
                    return insideEntitySynchronizedAndDebounced(entityDescriptors[k][field](mutationArg));
                };
        });
        synchronizers[k]["add"] = (entity, position) => insideEntitySynchronizedAndDebounced(entityDescriptors[k]["add"](entity, position));
        synchronizers[k]["remove"] = (entityId) => insideEntitySynchronizedAndDebounced(entityDescriptors[k]["remove"](entityId));
        synchronizers[k]["reload"] = () => entityDescriptors[k]["reload"]();
    });
    let loaders = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        loaders[k] = collectionEntityLoader(synchronizers)(k, entityDescriptors[k].id, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees);
    });
    let dirtyCheckers = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        dirtyCheckers[k] = Fun(collectionCheckNotDirty());
    });
    let dirtySetters = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        dirtySetters[k] =
            collectionDirtySetter()(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening);
    });
    let updaters = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        updaters[k] = collectionEntityUpdater()(entityDescriptors[k].widening);
    });
    return [loaders, dirtyCheckers, dirtySetters, updaters, entityDescriptors];
};
//# sourceMappingURL=synchronizers.js.map