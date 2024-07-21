import { SimpleCallback } from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";


export type FormInput<T> = BasicFun<{ value: T; onChange: SimpleCallback<T>; }, JSX.Element>;
