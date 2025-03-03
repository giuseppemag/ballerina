import {
  singletonSynchronizationContext,
  Synchronize,
  Value,
  Synchronized,
  Unit,
  PromiseRepo,
  unit,
  SynchronizeWithValueUpdater,
  AsyncState,
  withTrivialComparator,
  SynchronizableEntityDescriptors,
} from "ballerina-core";
import {
  User,
  UserData,
} from "../../domains/entities/domains/singletons/domains/user/state";
import {
  Singletons,
  SingletonMutations,
} from "../../domains/entities/domains/singletons/state";
import {
  DataSyncReadonlyContext,
  DataSyncWritableState,
  DataSync,
} from "../../state";

// const Co = CoTypedFactory<DataSyncReadonlyContext, DataSyncWritableState>();

const dataSyncSingletonsConfig: SynchronizableEntityDescriptors<
  DataSyncReadonlyContext,
  Singletons,
  SingletonMutations,
  DataSyncWritableState
> = {
  user: {
    entityName: "user",
    edit: withTrivialComparator((_) =>
      SynchronizeWithValueUpdater<Value<Synchronized<Unit, User>>, Unit>(
        (_) =>
          PromiseRepo.Default.mock(
            () => [
              unit,
              (_) => ({
                ..._,
                __debugLastSynchronizedValue: `last synchronized value ${JSON.stringify(AsyncState.Operations.hasValue(_.value.sync) ? _.value.sync.value : "no value in the AsyncState")}`,
              }),
            ],
            () => "error",
            0.8,
            0.5,
          ),
        (_) => "permanent failure",
        5,
        150,
      ),
    ),
    reload: withTrivialComparator((_) =>
      Synchronize<Value<Synchronized<Unit, User>>, Unit>(
        (_) =>
          PromiseRepo.Default.mock<Unit>(
            () => unit,
            () => "error",
            0.8,
            0.5,
          ),
        (_) => "permanent failure",
        5,
        150,
      ),
    ),
    // Synchronize<Unit, User>(_ => PromiseRepo.Default.mock<User>(() =>
    // User.Default.left(UserData.Default(v4(), faker.person.firstName(), faker.person.lastName())), () => "error", 0.8, 0.5), _ => "transient failure", 5, 150),
    narrowing: (_) => _.entities.singletons.user,
    widening:
      DataSync().Updaters.Core.entities.children.Core.singletons.children.user,
    dependees: [],
  },
};

export const singletonsConfig = () =>
  singletonSynchronizationContext<
    DataSyncReadonlyContext,
    Singletons,
    SingletonMutations,
    DataSyncWritableState
  >(dataSyncSingletonsConfig);
