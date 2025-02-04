import { ApiConverters, CollectionReference, CollectionSelection, Value } from "ballerina-core";
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
    "SingleSelection": {
        fromAPIRawValue: _ => _ == undefined ? CollectionSelection().Default.right("no selection") :
            CollectionSelection().Default.left(
                _
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
		fromAPIRawValue: _ => _ == undefined ? List() : List(_.map(( _ : {key: any, value: any}) => ([_.key, _.value]))),
        toAPIRawValue: ([_, __]) => {
			const first = _.first()
			if(first && typeof first[0] == "string") return [_, ((_: string )=> [_, _])]
			if(first && typeof first[0] == "object" && "value" in first[0] && typeof first[0]["value"] == "object"  && "value" in first[0]["value"] &&  typeof first[0]["value"]["value"] == "object" &&  "id" in first[0]["value"]["value"] && "displayName" in first[0]["value"]["value"]) return [_, ((_: Value<CollectionReference>) => [_.value.id, _.value.displayName])]
            if(first && typeof first[0] == "object" && "value" in first[0] && typeof first[0]["value"] == "object"  && "id" in first[0]["value"] && "displayName" in first[0]["value"]) return [_, ((_: CollectionReference) => [_.id, _.displayName])]
			return [_, (_: any) => [JSON.stringify(_), JSON.stringify(_)]]
		}
	}
}
