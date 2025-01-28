import { useState } from "react";
import { Map, OrderedMap } from "immutable";
import "./App.css";
import { Sum, unit, Unit } from "ballerina-core";

type ValueEdit =
	| { kind: "number", value: number }
	| { kind: "string", value: string }
	| { kind: "stringWithApproval", value: Sum<string, boolean> }
	| { kind: "nested", value: [FieldIdentifier, ValueEdit] }
	| { kind: "table", value: [number, ValueEdit] }
type FieldEdit = { fieldPath:FieldPath, valueEdit:ValueEdit }

type FieldIdentifier = string
type WithApproval<v> = { value: v, approved: boolean }
type Value =
	| { kind: "number", value: number }
	| { kind: "string", value: string }
	| { kind: "stringWithApproval", value: WithApproval<string> }
	| { kind: "nested", value: OrderedMap<FieldIdentifier, Value> }
	| { kind: "table", value: Array<Value> }
const Value = {
	Default: {
		Number: (value: number): Value => ({ kind: "number", value }),
		String: (value: string): Value => ({ kind: "string", value }),
		StringWithApproval: (value: string, approved: boolean): Value => ({ kind: "stringWithApproval", value: { value, approved } }),
		Nested: (value: OrderedMap<FieldIdentifier, Value>): Value => ({ kind: "nested", value }),
		Table: (value: Array<Value>): Value => ({ kind: "table", value }),
	},
	Operations: {
		TryFind: (pathToField: FieldPath) => (value: Value): Sum<Unit, Value> =>
			pathToField.length == 0 ?
				Sum.Default.right(value)
				: typeof (pathToField[0]) == "number" && value.kind == "table" ?
					Value.Operations.TryFind(pathToField.slice(1))(value.value[pathToField[0]])
					: typeof (pathToField[0]) == "string" && value.kind == "nested" && value.value.has(pathToField[0]) ?
						Value.Operations.TryFind(pathToField.slice(1))(value.value.get(pathToField[0])!)
						: Sum.Default.left(unit)
	}
}

type FieldPath = Array<FieldIdentifier | number>

type CardField = { kind: "section", card: CardConfig } | { kind: "field lookup", pathToField: FieldPath, disabled?: true }
const CardField = {
	Default: {
		Section: (card: CardConfig): CardField => ({ kind: "section", card }),
		FieldLookup: (pathToField: FieldPath, disabled?: true): CardField => ({ kind: "field lookup", pathToField, disabled }),
	}
}
type CardConfig = {
	header: string
	fields: Array<CardField>
}
const Card = {
	Default: (header: string, fields: Array<CardField>): CardConfig => ({ header, fields })
}

const entityFromAPI: Value = Value.Default.Nested(
	Map([
		["name", Value.Default.String("Joe")],
		["surname", Value.Default.String("Gojack")],
		["age", Value.Default.Number(31)],
		["address", Value.Default.Nested(
			Map([
				["city", Value.Default.String("Mirano")],
				["street", Value.Default.String("Don Minzoni")],
				["number", Value.Default.Number(20)],
			])
		)],
		["children", Value.Default.Table([
			Value.Default.Nested(
				Map(
					[
						["name", Value.Default.String("Joe jr")],
						["surname", Value.Default.String("Gojack")],
						["age", Value.Default.Number(6)],
					]
				)
			),
			Value.Default.Nested(
				Map(
					[
						["name", Value.Default.String("Little Jane")],
						["surname", Value.Default.String("Gojack")],
						["age", Value.Default.Number(3)],
					]
				)
			)
		])],
	])
)
const cardsConfigFromAPI: Array<CardConfig> =
	[
		Card.Default("About me", [
			CardField.Default.FieldLookup(["name"]),
			CardField.Default.FieldLookup(["surname"], true),
			CardField.Default.FieldLookup(["age"])
		]),
		Card.Default("Address", [
			CardField.Default.FieldLookup(["address", "city"]),
			CardField.Default.FieldLookup(["address", "street"]),
			CardField.Default.FieldLookup(["address", "number"])
		]),
		Card.Default("First child", [
			CardField.Default.FieldLookup(["children", 0, "name"]),
			CardField.Default.FieldLookup(["children", 0, "surname"]),
			CardField.Default.FieldLookup(["children", 0, "age"])
		]),
		Card.Default("Second child", [
			CardField.Default.FieldLookup(["children", 1, "name"]),
			CardField.Default.FieldLookup(["children", 1, "surname"]),
			CardField.Default.FieldLookup(["children", 1, "age"])
		]),
	]

const NumberRenderer = (props: { value: number, onNewValue:(edit:ValueEdit & { kind:"number" }) => void }): JSX.Element =>
	<>
		<h2>Number</h2>
		{props.value}
	</>
const StringRenderer = (props: { value: string, onNewValue:(edit:ValueEdit) => void }): JSX.Element =>
	<>
		<h2>String</h2>
		{props.value}
	</>
const StringWithApprovalRenderer = (props: { value: WithApproval<string>, onNewValue:(edit:ValueEdit) => void }): JSX.Element =>
	<>
		<h2>String with approval</h2>
		{props.value.value}
		{props.value.approved ? "approved" : "not approved"}
	</>
const NestedRenderer = (props: { value: OrderedMap<FieldIdentifier, Value>, onNewValue:(edit:ValueEdit) => void }): JSX.Element =>
	<>
		<h2>Nested</h2>
		{props.value.map((value, fieldname) => ValueRenderer({ value, onNewValue:edit => 
			props.onNewValue({ kind:"nested", value:[fieldname, edit] as [FieldIdentifier, ValueEdit] }) })).valueSeq()}
	</>
const TableRenderer = (props: { value: Array<Value>, onNewValue:(edit:ValueEdit) => void }): JSX.Element =>
	<>
		<h2>Table</h2>
		{props.value.map((value,index) => ValueRenderer({ value, onNewValue:edit => props.onNewValue({ kind:"table", value:[index, edit]}) }))}
	</>
const ValueRenderer = (props: { value: Value, onNewValue:(edit:ValueEdit) => void }): JSX.Element =>
	props.value.kind == "number" ? <NumberRenderer value={props.value.value} onNewValue={props.onNewValue} />
		: props.value.kind == "string" ? <StringRenderer value={props.value.value} onNewValue={props.onNewValue} />
			: props.value.kind == "stringWithApproval" ? <StringWithApprovalRenderer value={props.value.value} onNewValue={props.onNewValue} />
				: props.value.kind == "nested" ? <NestedRenderer value={props.value.value} onNewValue={props.onNewValue} />
					: <TableRenderer value={props.value.value} onNewValue={props.onNewValue} />

export const CardRenderer = (props: { cardConfig: CardConfig, entity: Value, onNewField:(edit:FieldEdit) => void }) => {
	return <>
		<h1>{props.cardConfig.header}</h1>
		<ul>
			{
				props.cardConfig.fields.map(fieldPath => {
					if (fieldPath.kind == "field lookup") {
						const fieldValue = Value.Operations.TryFind(fieldPath.pathToField)(props.entity)
						return fieldValue.kind == "l" ?
							<>
								Error: cannot find field ${JSON.stringify(fieldPath)}
							</>
							: <>
								{fieldPath.disabled == true ? "disabled" : undefined}
								<ValueRenderer value={fieldValue.value} onNewValue={valueEdit => props.onNewField({ fieldPath:fieldPath.pathToField, valueEdit }) } />
							</>
					} else {
						return <CardRenderer {...props} cardConfig={fieldPath.card} />
					}
				})
			}
		</ul >
	</>
}


/*
- define neat domains with synchronized and such
*/

export const DataDrivenFieldsApp = (props: {}) => {

	return (
		<div className="App">
			<h1>Ballerina 🩰</h1>
			<div className="card">
				<table>
					<tbody>
						<tr>
							{
								cardsConfigFromAPI.map(cardConfig =>
									<td>
										<CardRenderer cardConfig={cardConfig} entity={entityFromAPI} onNewField={fieldEdit => alert(JSON.stringify(fieldEdit))} />
									</td>
								)
							}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
