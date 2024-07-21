import { FormInput } from "./base";


export const SimpleBooleanInput: FormInput<boolean> = props => <input type="checkbox" checked = { props.value } onChange = { e => props.onChange(e.currentTarget.checked) } />;
