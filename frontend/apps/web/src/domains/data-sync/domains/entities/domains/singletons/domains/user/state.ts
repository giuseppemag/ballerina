import { SmallIdentifiable, Guid, simpleUpdater, Sum, Unit } from "ballerina-core";


export type UserData = SmallIdentifiable & {
  name: string; surname: string;
};

export const UserData = {
  Default: (id: Guid, name: string, surname: string): UserData => ({ id, name, surname }),
  Updaters: {
    Core: {
      ...simpleUpdater<UserData>()("name"),
      ...simpleUpdater<UserData>()("surname"),
    }
  }
};
export type User = Sum<UserData, "no user selected">;
export const User = Sum<UserData, "no user selected">();
export type UserMutations = {
  edit: Unit;
};
