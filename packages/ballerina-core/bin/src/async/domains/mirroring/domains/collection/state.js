import { Value, AsyncState, Debounced, Synchronized, Updater, unit, simpleUpdater, OrderedMapRepo } from "@core";
import { Entity } from "../entity/state";
export const CollectionEntity = () => ({
    Default: (value) => Object.assign(Entity().Default(value), { removed: false }),
    Updaters: {
        Core: {
            entity: (_) => Updater(e => (Object.assign(Object.assign({}, (_(e))), { removed: e.removed }))),
            removed: (_) => Updater(e => (Object.assign(Object.assign({}, e), { removed: _(e.removed) })))
        }
    }
});
export const Collection = () => {
    return ({
        Default: (entities) => ({
            entities: Synchronized.Default(unit, AsyncState.Default.loaded(entities.map(_ => (Object.assign(Object.assign({}, _), { removed: false }))))),
        }),
        Updaters: {
            Core: Object.assign(Object.assign({}, simpleUpdater()("entities")), { 
                // reloader: (u: BasicUpdater<OrderedMap<Guid, CollectionEntity<E>>>): Updater<Collection<E>> =>
                //   Collection<E>().Updaters.Core.entities(
                //     Synchronized.Updaters.sync(
                //       AsyncState.Operations.map(
                //         u
                //       )
                //     )
                //   ),
                entity: {
                    add: ([id, value, position]) => position.kind == "at the end" ?
                        Collection().Updaters.Core.entities(Synchronized.Updaters.sync(AsyncState.Operations.map(OrderedMapRepo.Updaters.insertAtEnd(id, value)))) :
                        position.kind == "at the beginning" ?
                            Collection().Updaters.Core.entities(Synchronized.Updaters.sync(AsyncState.Operations.map(OrderedMapRepo.Updaters.insertAtBeginning(id, value)))) :
                            Collection().Updaters.Core.entities(Synchronized.Updaters.sync(AsyncState.Operations.map(OrderedMapRepo.Updaters.insertAt([id, value], position.id, position.kind)))),
                    remove: (id) => Collection().Updaters.Core.entities(Synchronized.Updaters.sync(AsyncState.Operations.map(OrderedMapRepo.Updaters.remove(id)))),
                    set: (id) => (u) => Collection().Updaters.Core.entities(Synchronized.Updaters.sync(AsyncState.Operations.map(OrderedMapRepo.Updaters.update(id, u)))),
                    // set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
                }, removed: (id, u) => Collection().Updaters.Core.entity.set(id)(CollectionEntity().Updaters.Core.removed(u)), entityValue: (id, u) => Collection().Updaters.Core.entity.set(id)(CollectionEntity().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Core.value(Synchronized.Updaters.value(Value.Updaters.value(Synchronized.Updaters.sync(AsyncState.Operations.map(u)))))))) }),
            Template: {
                entityValue: (id, u) => Collection().Updaters.Core.entity.set(id)(CollectionEntity().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Template.value(Synchronized.Updaters.value(Value.Updaters.value(Synchronized.Updaters.sync(AsyncState.Operations.map(u)))))))),
            }
        }
    });
};
//# sourceMappingURL=state.js.map