import { simpleUpdater } from "../../../../../../main";


export type StreamValue = {
  Id: string;
  DisplayValue: string;
  kind: "stream";
}

export type EnumValue = {
  Value: string;
  kind: "enum"
}

export type CollectionReference = StreamValue | EnumValue;

export const CollectionReference = {
  Default: {
    stream: (Id: string, DisplayValue: string): StreamValue => ({
      Id, DisplayValue, kind: "stream"
    }),
    enum: (Value: string ): EnumValue => ({
      Value, kind: "enum"
    }),
    emptyStream: (): CollectionReference => CollectionReference.Default.stream("", ""),
    emptyEnum: (): CollectionReference => CollectionReference.Default.enum("")
  },
  Updaters: {
    stream: {
      ...simpleUpdater<StreamValue>()("Id"),
      ...simpleUpdater<StreamValue>()("DisplayValue"),
    },
    enum: {
      ...simpleUpdater<EnumValue>()("Value"),
    },
  }
}
