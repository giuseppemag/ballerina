type Props = {
  x: number,
  y: string
}

export const Child1Table = (props: Props): JSX.Element => <>
  <table style={{ width: "500px" }}>
    <tr>
      <td>x: </td>
      <td>{props.x}</td>
    </tr>
    <tr>
      <td>y: </td>
      <td>{props.y}</td>
    </tr>
  </table>
</>;
