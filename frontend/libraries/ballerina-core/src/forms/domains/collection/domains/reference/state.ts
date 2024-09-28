import { simpleUpdater } from "../../../../../../main";


export type CollectionReference = {
  id: string;
  displayName: string;
};
export const CollectionReference = {
  Default: Object.assign((id: string, displayName: string): CollectionReference => ({
    id, displayName
  }), {
    empty: (): CollectionReference => CollectionReference.Default("", "")
  }),
  Updaters: {
    ...simpleUpdater<CollectionReference>()("id"),
    ...simpleUpdater<CollectionReference>()("displayName"),
  }
};
