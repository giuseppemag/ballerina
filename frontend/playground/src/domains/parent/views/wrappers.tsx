export const ParentWrapper = (props:{ children?: Array<JSX.Element> | JSX.Element }) =>
  <div>
    {props.children}
  </div>


export const ChildWrapper = (props: { children?: Array<JSX.Element> | JSX.Element }) =>
	<td>
		{props.children}
	</td>

export const ChildrenWrapper = (props: { children?: Array<JSX.Element> | JSX.Element }) =>
	<table>
		<tbody>
		<tr>
			{props.children}
		</tr>
		</tbody>
	</table>