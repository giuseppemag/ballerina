import React from "react";
import { Unit } from "../../../../../../../../main";
import { Template } from "../../../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { UnitFormState, UnitFormView } from "./state";

export const UnitForm = <Context extends FormLabel>() =>
  Template.Default<
    Context & { disabled: boolean },
    UnitFormState,
    Unit,
    UnitFormView<Context>
  >((props) => <props.view {...props} />);
