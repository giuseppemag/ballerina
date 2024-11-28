import { simpleUpdater } from "../../../../../../main";


export type CollectionReference = {
  id: string;
  displayName: string;
  source?:"enum"|"stream"
};
export const CollectionReference = {
  Default: Object.assign((id: string, displayName: string, source?:"enum"|"stream"): CollectionReference => ({
    id, displayName, source
  }), {
    empty: (): CollectionReference => CollectionReference.Default("", "")
  }),
  Updaters: {
    ...simpleUpdater<CollectionReference>()("id"),
    ...simpleUpdater<CollectionReference>()("displayName"),
  }
};
