import { Parent } from "playground-core";

export const ParentTable = (props: Parent) =>
	<>
			<table style={{ width: "1000px" }}>
			<tr>
				<td>Value:</td>
				<td>{props.inputString.value}</td>
			</tr>
			<tr>
				<td>Last updated:</td>
				<td>{props.inputString.lastUpdated}</td>
			</tr>
			<tr>
				<td>DeltaT:</td>
				<td>{Date.now() - props.inputString.lastUpdated}</td>
			</tr>
			<tr>
				<td>Dirty:</td>
				<td>{props.inputString.dirty}</td>
			</tr>
			<tr>
				<td>Status:</td>
				<td style={{ width: "800px" }}>{props.inputString.status}</td>
			</tr>
		</table>
	</>