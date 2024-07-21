import { FormInput } from "./base";


export const SimpleStringInput: FormInput<string> = props => <input value={ props.value } onChange = { e => props.onChange(e.currentTarget.value)}/>;
