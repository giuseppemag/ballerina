import { List } from "immutable";
import { BasicFun, NumberView, replaceWith, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange, CommonFormState } from "../../../singleton/state";


export const NumberForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<number, Promise<FieldValidation>>
) => {
  return Template.Default<Context & Value<number> & { disabled:boolean }, { commonFormState: CommonFormState }, ForeignMutationsExpected & { onChange: OnChange<number>; },
  NumberView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props} 
    foreignMutations={{
      ...props.foreignMutations,
      setNewValue:(_) => props.foreignMutations.onChange(replaceWith(_), List())
    }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, { commonFormState: CommonFormState }, ForeignMutationsExpected, number>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ]);
}
