import { SimpleCallback } from "../../core/fun/domains/simpleCallback/state"

export const ParentInputs = (props:{
  counter:number,
  onIncrement:SimpleCallback,
  onDoubleIncrement:SimpleCallback,
  inputString:string,
  onChangeInputString:SimpleCallback<string>,
}) => 
  <>
    <p>The counter is {props.counter}</p>
    <button onClick={() => props.onIncrement()}>
      +1
    </button>
    <button onClick={() => props.onDoubleIncrement()}>
      +2
    </button>
    <p>The input string is {props.inputString}</p>
    <input value={props.inputString} onChange={e => props.onChangeInputString(e.currentTarget.value)} />
  </>
  