import { replaceWith, Value } from "@core";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { Debounced } from "../../../../../../debounced/state";
import { Fun } from "../../../../../../fun/state";
import { Synchronized } from "../../../../synchronized/state";
import { Entity } from "../../entity/state";
import { Singleton } from "../state";
export const insideEntitySynchronizedAndDebounced = (k) => {
    const Co = CoTypedFactory();
    return Co.SetState(Entity().Updaters.Core.value(Debounced.Updaters.Core.dirty(replaceWith("dirty but being processed")))).then(() => k.embed(_ => (Object.assign(Object.assign({}, _), _.value)), (u) => Entity().Updaters.Core.value(Debounced.Updaters.Core.value(u))).then(() => Co.GetState().then(current => {
        if (current.value.dirty == "dirty but being processed") {
            return Co.Return("completed");
            // Co.SetState(
            //   Entity<E>().Updaters.Core.value(
            //     Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>("not dirty"))
            //   )
            // ).then(() => Co.Return<SynchronizationResult>("completed")
            // );
        }
        else {
            return Co.Return("should be enqueued again");
        }
    })));
};
export const singletonEntityLoader = (synchronizers) => (k, narrowing_k, widening_k, dependees) => (mutation, mutationArg) => {
    const Co = CoTypedFactory();
    return synchronizers[k][mutation](mutationArg).embed(_ => (Object.assign(Object.assign({}, _), narrowing_k(_).entity)), Singleton().Updaters.Core.entity.then(widening_k)).then(syncResult => Co.All(dependees).then(syncResults => Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")));
};
export const reloaderToEntity = (k) => {
    const Co = CoTypedFactory();
    return Co.Seq([
        k.embed(_ => (Object.assign(Object.assign({}, _), _.value.value)), (_) => Entity().Updaters.Core.value(Debounced.Updaters.Core.value(Synchronized.Updaters.value(Value.Updaters.value(_)))))
    ]).then(() => Co.Return("completed"));
};
export const singletonEntityReloader = (synchronizers) => (k, narrowing_k, widening_k, dependees) => {
    const Co = CoTypedFactory();
    return (synchronizers[k]).embed(_ => (Object.assign(Object.assign({}, _), narrowing_k(_).entity)), Singleton().Updaters.Core.entity.then(widening_k)).then(syncResult => Co.All(dependees).then(syncResults => Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")));
};
export const singletonDirtySetter = () => (k, narrowing_k, widening_k) => (dirtyStatus) => {
    const CoEntity = CoTypedFactory();
    const Co = CoTypedFactory();
    return (CoEntity.SetState(Entity().Updaters.Core.value(Debounced.Updaters.Core.dirty(replaceWith(dirtyStatus))))).embed(_ => (Object.assign(Object.assign({}, _), narrowing_k(_).entity)), Singleton().Updaters.Core.entity.then(widening_k));
};
export const singletonCheckNotDirty = () => ([_, e]) => e.entity.value.dirty != "not dirty";
export const singletonEntityUpdater = () => (widening_k) => Fun(([_, u]) => widening_k(Singleton().Updaters.Template.entityValue(u)));
export const singletonSynchronizationContext = (entityDescriptors) => {
    let synchronizers = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        synchronizers[k] = {};
        Object.keys(entityDescriptors[k]).forEach(field => {
            // only update the mutation fields of the entity descriptor
            if (field != "entityName" && field != "narrowing" && field != "widening" && field != "dependees" && field != "reload")
                synchronizers[k][field] = (mutationArg) => insideEntitySynchronizedAndDebounced(entityDescriptors[k][field](mutationArg));
        });
    });
    let loaders = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        loaders[k] = singletonEntityLoader(synchronizers)(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees);
    });
    let reloadSynchronizers = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        reloadSynchronizers[k] = reloaderToEntity((entityDescriptors[k])["reload"]);
    });
    let reloaders = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        reloaders[k] = singletonEntityReloader(reloadSynchronizers)(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees);
    });
    let dirtyCheckers = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        dirtyCheckers[k] = Fun(singletonCheckNotDirty());
    });
    let dirtySetters = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        dirtySetters[k] = singletonDirtySetter()(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening);
    });
    let updaters = {};
    Object.keys(entityDescriptors).forEach(k_s => {
        const k = k_s;
        updaters[k] = singletonEntityUpdater()(entityDescriptors[k].widening);
    });
    return [loaders, reloaders, dirtyCheckers, dirtySetters, updaters, entityDescriptors];
};
//# sourceMappingURL=synchronizers.js.map