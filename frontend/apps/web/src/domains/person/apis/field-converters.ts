import {
  ApiConverters,
  CollectionSelection,
  fromAPIRawValue,
  RawSum,
  Sum,
  toAPIRawValue,
} from "ballerina-core";
import { List, OrderedMap } from "immutable";
import { PersonFormInjectedTypes } from "src/domains/person-from-config/injected-forms/category";

export const fieldTypeConverters: ApiConverters<PersonFormInjectedTypes> = {
  injectedCategory: {
    fromAPIRawValue: (_) => _ ?? "adult",
    toAPIRawValue: ([_, __]) => _,
  },
  string: {
    fromAPIRawValue: (_) => (typeof _ == "string" ? _ : ""),
    toAPIRawValue: ([_, __]) => _,
  },
  number: {
    fromAPIRawValue: (_) => (typeof _ == "number" ? _ : 0),
    toAPIRawValue: ([_, __]) => _,
  },
  boolean: {
    fromAPIRawValue: (_) => (typeof _ == "boolean" ? _ : false),
    toAPIRawValue: ([_, __]) => _,
  },
  base64File: {
    fromAPIRawValue: (_) => (typeof _ == "string" ? _ : ""),
    toAPIRawValue: ([_, __]) => _,
  },
  secret: {
    fromAPIRawValue: (_) => (typeof _ == "string" ? _ : ""),
    toAPIRawValue: ([_, isModified]) => (isModified ? _ : undefined),
  },
  Date: {
    fromAPIRawValue: (_) =>
      typeof _ == "string"
        ? new Date(Date.parse(_))
        : typeof _ == "number"
          ? new Date(_)
          : new Date(Date.now()),
    toAPIRawValue: ([_, __]) => _,
  },
  unionCase: { fromAPIRawValue: (_) => _, toAPIRawValue: ([_, __]) => _ },
  SingleSelection: {
    fromAPIRawValue: (_) =>
      _.IsSome == false
        ? CollectionSelection().Default.right("no selection")
        : CollectionSelection().Default.left(_.Value),
    toAPIRawValue: ([_, __]) =>
      _.kind == "r"
        ? { IsSome: false, Value: null }
        : { IsSome: true, Value: _.value },
  },
  MultiSelection: {
    fromAPIRawValue: (_) =>
      _ == undefined
        ? OrderedMap()
        : OrderedMap(
            _.map((_: any) => ("Value" in _ ? [_.Value, _] : [_.Id, _])),
          ),
    toAPIRawValue: ([_, __]) => _.valueSeq().toArray(),
  },
  List: {
    fromAPIRawValue: (_) => (_ == undefined ? List() : List(_)),
    toAPIRawValue: ([_, __]) => _.valueSeq().toArray(),
  },
  Map: {
    fromAPIRawValue: (_) =>
      _ == undefined
        ? List()
        : List(_.map((_: { key: any; value: any }) => [_.key, _.value])),
    toAPIRawValue: ([_, __]) =>
      _.valueSeq()
        .toArray()
        .map((_: any) => ({
          key: _[0],
          value: _[1],
        })),
  },
  Sum: {
    fromAPIRawValue: (_: RawSum) =>
      _ === undefined
        ? Sum.Default.right(null)
        : _.Kind === "l"
          ? Sum.Default.left(_.Value)
          : Sum.Default.right(_.Value),
    toAPIRawValue: ([_, __]) => _,
  },
};
