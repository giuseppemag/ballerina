import { apiResultStatuses } from "ballerina-core";
import { Value } from "ballerina-core";
import { ValidationResult } from "ballerina-core";
import { PromiseRepo } from "ballerina-core";

export const ParentApi = {
  validateInputString: (_: Value<string>): Promise<ValidationResult> =>
    PromiseRepo.Default.mock<ValidationResult>(
      () =>
        Math.random() > 0.9
          ? "valid"
          : {
              kind: "error",
              errors: ["validation error 1", "validation error 2"],
            },
      () => apiResultStatuses[2],
      0.8,
      0.2,
    ),
};
