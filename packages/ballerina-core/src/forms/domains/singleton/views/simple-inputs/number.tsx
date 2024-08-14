import { FormInput } from "./base";


export const SimpleNumberInput: FormInput<number> = props => <input type="number" value = { props.value } onChange = { e => props.onChange(parseInt(e.currentTarget.value)) } />;
