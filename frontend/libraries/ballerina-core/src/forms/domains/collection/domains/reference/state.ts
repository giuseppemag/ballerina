import { simpleUpdater } from "../../../../../../main";


export type CollectionReference = {
  Id: string;
  DisplayValue: string;
  source?:"enum"|"stream"
};
export const CollectionReference = {
  Default: Object.assign((Id: string, DisplayValue: string, source?:"enum"|"stream"): CollectionReference => ({
    Id, DisplayValue, source
  }), {
    empty: (): CollectionReference => CollectionReference.Default("", "")
  }),
  Updaters: {
    ...simpleUpdater<CollectionReference>()("Id"),
    ...simpleUpdater<CollectionReference>()("DisplayValue"),
  }
};
