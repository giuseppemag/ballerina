import { List } from "immutable";
import {
  FormFieldPredicateEvaluation,
  ParsedType,
  FormLabel,
  replaceWith,
  Unit,
  OnChange,
  Delta,
  PredicateValue,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { UnitFormState, UnitFormView } from "./state";

export const UnitForm = <Context extends FormLabel>() =>
  Template.Default<
    Context & { disabled: boolean; type: ParsedType<any> },
    UnitFormState,
    { onChange: OnChange<Unit> },
    UnitFormView<Context>
  >((props) => (
    <props.view
      {...props}
      foreignMutations={{
        ...props.foreignMutations,
        onChange: (_) => {
          const delta: Delta = {
            kind: "UnitReplace",
            replace: PredicateValue.Default.unit(),
            state: {
              commonFormState: props.context.commonFormState,
              customFormState: props.context.customFormState,
            },
            type: props.context.type,
          };
          props.foreignMutations.onChange(_, delta);
        },
      }}
    />
  ));
