import { Child2WritableState } from "../state";

export const Child2Table = (props: Child2WritableState) => <>
	<h2>Child 2</h2>
  <table style={{ width: "500px" }}>
		<tr>
			<td>a:</td><td>{props.a}</td>
		</tr>
		<tr>
			<td>b:</td><td>{props.b}</td>
		</tr>
	</table>
</>;
