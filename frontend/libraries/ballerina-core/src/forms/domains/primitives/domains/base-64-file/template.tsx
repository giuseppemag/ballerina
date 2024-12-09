import { List } from "immutable";
import { BasicFun, replaceWith, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange, SharedFormState } from "../../../singleton/state";
import { Base64FileView } from "./state";


export const Base64FileForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?:BasicFun<string, Promise<FieldValidation>>) => {
  return Template.Default<Context & Value<string> & { disabled:boolean }, SharedFormState, ForeignMutationsExpected & { onChange: OnChange<string>; }, Base64FileView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => props.foreignMutations.onChange(replaceWith(_), List())
      }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, SharedFormState, ForeignMutationsExpected, string>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ])
}
