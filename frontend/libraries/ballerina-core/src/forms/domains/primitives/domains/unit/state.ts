
import { FormLabel, Unit, View } from "../../../../../../main";
import { CommonFormState } from "../../../singleton/state";

export type UnitFieldState = {
  commonFormState: CommonFormState;
}

export const UnitFieldState = () => ({
  Default: (): UnitFieldState => ({
    commonFormState: CommonFormState.Default(),
  }),
});

export type UnitFieldView<
  Context extends FormLabel
> = View<
  Context & UnitFieldState,
  UnitFieldState,
  Unit
>;