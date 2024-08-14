import { FormInput } from "./base";


export const SimpleDateInput: FormInput<Date> = props => <input type="date" value = { props.value.toDateString() } onChange = { e => props.onChange(new Date(Date.parse(e.currentTarget.value))) } />;
