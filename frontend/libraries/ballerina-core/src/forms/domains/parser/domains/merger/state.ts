import { FormValidationError } from "../validator/state";

export const FormsConfigMerger = {
  Default: {
    merge: (
      formsConfigs: any,
      errors: Array<FormValidationError>,
    ): [any, Array<FormValidationError>] => {
      return null!;
    },
  },
};
