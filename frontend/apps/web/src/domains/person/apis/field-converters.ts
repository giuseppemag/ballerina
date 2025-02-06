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
            typeof _ == "object" && "Value" in _ ?
            CollectionSelection().Default.left(CollectionReference.Default.enum(_.Value)) :
            typeof _ == "object" && "Id" in _ && "DisplayValue" in _ ?
            CollectionSelection().Default.left(CollectionReference.Default.stream(_.Id, _.DisplayValue)) :
            CollectionSelection().Default.right("no selection"),
        toAPIRawValue: ([_, __]) => {
			return _.kind == "r" ? undefined :
            _.value.kind == "enum" ? { Value: _.value.Value } :
            {Id: _.value.Id, DisplayValue: _.value.DisplayValue}
        }
    },
    "MultiSelection": {
        fromAPIRawValue: _ => { 
            return _ == undefined ? OrderedMap() :
            OrderedMap(_.map(
                (_: any) => (
                    typeof _ == "object" && "Value" in _ ?
                    [_.Value, CollectionReference.Default.enum(_.Value)] :
                    typeof _ == "object" && "Id" in _ && "DisplayValue" in _ ?
                    [_.Id, CollectionReference.Default.stream(_.Id, _.DisplayValue)] :
                    undefined
                )))
            },

        toAPIRawValue: ([_, __]) =>  _.valueSeq().toArray().map(_ => _.kind == "enum" ? { Value: _.Value } :
            {Id: _.Id, DisplayValue: _.DisplayValue})
    },
    "List": {
        fromAPIRawValue: _ => _ == undefined ? List() : List(_),
        toAPIRawValue: ([_, __]) => _.valueSeq().toArray()
    },
    "Map": {
		fromAPIRawValue: _ => _ == undefined ? List() : List(_.map(( _ : {key: any, value: any}) => ([_.key, _.value]))),
        toAPIRawValue: ([_, __]) => _.valueSeq().toArray()
	}
}
