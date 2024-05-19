import { apiResultStatuses } from "../../core/apiResultStatus/state";
import { Value } from "../../core/value/state";
import { Validation } from "../../core/validation/state";
import { PromiseRepo } from "../../core/async/domains/promise/state";


export const ParentApi = {
  validateInputString: (_: Value<string>): Promise<Validation> => 
    PromiseRepo.Default.mock<Validation>(
      () => Math.random() > 0.9 ? "valid" : ({ kind: "error", errors: ["validation error 1", "validation error 2"] }),
      () => apiResultStatuses[2],
      0.8,
      0.2
    )
};
