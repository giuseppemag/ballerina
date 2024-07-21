import { singletonSynchronizationContext, Synchronize, Value, Synchronized, Unit, PromiseRepo, unit } from "ballerina-core";
import { User, UserData } from "../../domains/entities/domains/singletons/domains/user/state";
import { Singletons, SingletonMutations } from "../../domains/entities/domains/singletons/state";
import { DataSyncReadonlyContext, DataSyncWritableState, DataSync } from "../../state";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

// const Co = CoTypedFactory<DataSyncReadonlyContext, DataSyncWritableState>();
export const singletonsConfig = () => singletonSynchronizationContext<DataSyncReadonlyContext, Singletons, SingletonMutations, DataSyncWritableState>({
  user: {
    entityName: "user",
    edit: Synchronize<Value<Synchronized<Unit, User>>, Unit>(_ => PromiseRepo.Default.mock<Unit>(() => unit, () => "error", 0.8, 0.5), _ => "permanent failure", 5, 150),
    reload: Synchronize<Unit, User>(_ => PromiseRepo.Default.mock<User>(() => 
      User.Default.left(UserData.Default(v4(), faker.person.firstName(), faker.person.lastName())), () => "error", 0.8, 0.5), _ => "transient failure", 5, 150),
    narrowing: _ => _.entities.singletons.user,
    widening: DataSync().Updaters.Core.entities.children.Core.singletons.children.user,
    dependees: []
  }
});
