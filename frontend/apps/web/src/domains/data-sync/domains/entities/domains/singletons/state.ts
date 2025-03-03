import { User, UserMutations } from "./domains/user/state";

export type Singletons = {
  user: User;
};
export type SingletonMutations = {
  user: UserMutations;
};
