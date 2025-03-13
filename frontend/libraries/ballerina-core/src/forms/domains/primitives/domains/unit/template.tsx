import {
  FormFieldPredicateEvaluation,
  FormLabel,
  Unit,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { UnitFieldState, UnitFieldView } from "./state";

export const UnitForm = <Context extends FormLabel>() =>
  Template.Default<
    Context & { disabled: boolean },
    UnitFieldState,
    Unit,
    UnitFieldView<Context>
  >((props) => <props.view {...props} />);
