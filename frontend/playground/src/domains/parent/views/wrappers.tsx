export const ParentWrapper = (_:JSX.Element) =>
  <div>
    {_}
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