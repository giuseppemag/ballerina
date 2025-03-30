import { Unit, simpleUpdater } from "../../../../../../../../main";
import { View } from "../../../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { CommonFormState } from "../../../singleton/state";

export type UnitFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const UnitFormState = {
  Default: (): UnitFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<UnitFormState>()("commonFormState"),
    },
  },
};

export type UnitFormView<Context extends FormLabel> = View<
  Context & UnitFormState,
  UnitFormState,
  Unit
>;
