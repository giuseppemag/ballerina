import { simpleUpdater } from "../../../../../../main";


export type UnionCase = {
  Value: string;
  isSome: boolean;
};
export const UnionCase = {
  Default: Object.assign((Value: string, isSome: boolean): UnionCase => ({
    Value, isSome
  }), {
    empty: (): UnionCase => UnionCase.Default("", false)
  }),
  Updaters: {
    ...simpleUpdater<UnionCase>()("Value"),
    ...simpleUpdater<UnionCase>()("isSome"),
  }
};
