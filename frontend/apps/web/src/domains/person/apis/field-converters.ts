import { ApiConverters, BuiltInApiConverters, CollectionReference, CollectionSelection } from "ballerina-core";
import { List, OrderedMap, Map } from "immutable";
import { t } from "node_modules/i18next";
import { Category, PersonFormInjectedTypes } from "src/domains/person-from-config/injected-forms/category";

export const fieldTypeConverters: ApiConverters<PersonFormInjectedTypes> = {
	"injectedCategory": { fromAPIRawValue: _ => _, toAPIRawValue: ([_, __]) => _ },
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
        toAPIRawValue: ([_, __]) => _.kind == "r" ? undefined : _
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
		fromAPIRawValue: _ => _ == undefined ? List() : List(_),
        toAPIRawValue: ([_, __]) => {
			if (typeof _.get(0)?.[0] == "object" && _.get(0)?.[0].kind == "category") {
				return _.map(([k, v]) => ([(k as Category).category, v]))
			}
			else if( typeof _.get(0)?.[0] == "object" && "value" in _.get(0)?.[0] && "id" in _.get(0)?.[0]["value"]) {
				return _.map(([k, v]) => ([k["value"]["id"], v]))
			} else {
				return _
			}
		}
	}
}

const logWrapper = ([_, __]: any) => {
	if(__) console.log('value', _, 'isModified', __)
	return _
}

export const modifiedDebugFieldTypeConverters: ApiConverters<PersonFormInjectedTypes> = {
	"injectedCategory": { fromAPIRawValue: _ => _ , toAPIRawValue: ([_, __]) => logWrapper([_, __]) },
	"string": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, __]) => logWrapper([_, __]) },
	"number": { fromAPIRawValue: _ => typeof _ == "number" ? _ : 0, toAPIRawValue: ([_, __])  => logWrapper([_, __]) },
	"boolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : false, toAPIRawValue: ([_, __])  => logWrapper([_, __]) },
	"maybeBoolean": { fromAPIRawValue: _ => typeof _ == "boolean" ? _ : undefined, toAPIRawValue: ([_, __])  => logWrapper([_, __]) },
	"base64File": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, __]) => logWrapper([_, __]) },
	"secret": { fromAPIRawValue: _ => typeof _ == "string" ? _ : "", toAPIRawValue: ([_, isModified])  => (console.log({isModified, value: isModified ? _ : undefined}), isModified ? _ : undefined) },    
	"Date": { fromAPIRawValue: _ => typeof _ == "string" ? new Date(Date.parse(_)) : typeof _ == "number" ? new Date(_) : new Date(Date.now()), toAPIRawValue: ([_, __])  => logWrapper([_, __]) },
	"CollectionReference": {
		fromAPIRawValue: _ => CollectionReference.Default(_.id ?? "", _.displayName ?? ""),
		toAPIRawValue: ([_, __]) =>  {
			if(__) console.log({value: { id: _.id, displayName: _.displayName },  isModified:  __})
			return _.source == "enum" ? _.id : { id: _.id, displayName: _.displayName }
		}
	},
	"SingleSelection": {
		fromAPIRawValue: _ => _ == undefined ? CollectionSelection().Default.right("no selection") :
			CollectionSelection().Default.left(
				CollectionReference.Default(_.id ?? "", _.displayName ?? "")
			),
		toAPIRawValue: ([_, __]) => {
			if (__) console.log({value: { id: _.value.id, displayName: _.value.displayName },  isModified:  __})
			return _.kind == "r" ? undefined : _}
	},
	"MultiSelection": {
		fromAPIRawValue: _ => _ == undefined ? OrderedMap() : OrderedMap(_.map((_: any) => ([_.id, _]))),
		toAPIRawValue: ([_, __]) =>  {
			if (__) console.log({value: _.valueSeq().toArray(), isModified: __})
			return _.valueSeq().toArray()}
	},
	"List": {
		fromAPIRawValue: _ => _ == undefined ? List() : List(_),
		toAPIRawValue: ([_, __]) =>  {
			if(__) console.log({value: _.valueSeq().toArray(), isModified: __})
			return _.valueSeq().toArray()
		}
	},
	"Map": {
		fromAPIRawValue: _ => _ == undefined ? List() : List(_),
        toAPIRawValue: ([_, __]) => {
			if(__) console.log({value: _.valueSeq().toArray(), isModified: __})
			if (typeof _.get(0)?.[0] == "object" && _.get(0)?.[0].kind == "category") {
				return _.map(([k, v]) => ([(k as Category).category, v]))
			}
			else if( typeof _.get(0)?.[0] == "object" && "value" in _.get(0)?.[0] && "id" in _.get(0)?.[0]["value"]) {
				return _.map(([k, v]) => ([k["value"]["id"], v]))
			} else {
				return _
			}
		}
	}
}
