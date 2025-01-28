import { ApiConverters, CollectionReference, CollectionSelection } from "ballerina-core";
import { List, OrderedMap } from "immutable";
import { PersonFormInjectedTypes } from "src/domains/person-from-config/injected-forms/category";

export const fieldTypeConverters: ApiConverters<PersonFormInjectedTypes> = {
	"injectedCategory": { fromAPIRawValue: _ => ({ category: _ ?? "adult", kind: "category" as const }), toAPIRawValue: ([_, __]) => _.category },
    "string": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, __]) => _ },
    "number": { fromAPIRawValue: _ => typeof _ == "number" ? _ : 0, toAPIRawValue: ([_, __])  => _ },
    "boolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : false, toAPIRawValue: ([_, __])  => _ },
    "maybeBoolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : undefined, toAPIRawValue: ([_, __])  => _ },
    "base64File": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, __])  => _ },
    "secret": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, isModified])  => isModified ? _ : undefined },
    "Date": { fromAPIRawValue: _ => typeof _ == "string" ? new Date(Date.parse(_)) : typeof _ == "number" ? new Date(_) : new Date(Date.now()), toAPIRawValue: ([_, __])  => _ },
    "CollectionReference": {
        fromAPIRawValue: _ => CollectionReference.Default(_.id ?? "", _.displayName ?? ""),
        toAPIRawValue: ([_, __]) => _.source == "enum" ? _.id : { id: _.id, displayName: _.displayName }
    },
    "SingleSelection": {
        fromAPIRawValue: _ => _ == undefined ? CollectionSelection().Default.right("no selection") :
            CollectionSelection().Default.left(
                CollectionReference.Default(_.id ?? "", _.displayName ?? "")
            ),
        toAPIRawValue: ([_, __]) => {
			return _.kind == "r" ? undefined : _.value}
    },
    "MultiSelection": {
        fromAPIRawValue: _ => _ == undefined ? OrderedMap() : OrderedMap(_.map((_: any) => ([_.id, _]))),
        toAPIRawValue: ([_, __]) =>  _.valueSeq().toArray()
    },
    "List": {
        fromAPIRawValue: _ => _ == undefined ? List() : List(_),
        toAPIRawValue: ([_, __]) => _.valueSeq().toArray()
    },
    "Map": {
		fromAPIRawValue: _ => _ == undefined ? List() : List(_.map(( _ : {key: any, __keywordreplacement__value__: any}) => ([_.key, _.__keywordreplacement__value__]))),
        toAPIRawValue: ([_, __]) => {
			const first = _.first()
			if(first && typeof first[0] == "string") return [_, ((_: string )=> [_, _])]
			if(first && typeof first[0] == "object" && "value" in first[0]  && "id" in first[0]["value"] && "displayName" in first[0]["value"]) return [_, ((_: CollectionReference) => [_.id, _.displayName])]
			return [_, (_: any) => [JSON.stringify(_), JSON.stringify(_)]]
		}
	}
}
