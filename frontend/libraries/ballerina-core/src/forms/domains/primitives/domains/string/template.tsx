import { List } from "immutable";
import { BasicFun, CoTypedFactory, Debounce, Debounced, replaceWith, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, CommonFormState, ValidationError } from "../../../singleton/state";
import { StringView } from "./state";


export const StringForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?:BasicFun<string, Promise<FieldValidation>>) => {
  return Template.Default<Context & Value<string> & { disabled:boolean }, { commonFormState: CommonFormState, customFormState: Unit }, ForeignMutationsExpected & { onChange: OnChange<string>; }, StringView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => props.foreignMutations.onChange(replaceWith(_), List())
      }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, { commonFormState: CommonFormState, customFormState: Unit }, ForeignMutationsExpected, string>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ])
}
