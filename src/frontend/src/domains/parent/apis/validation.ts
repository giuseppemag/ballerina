import { apiResultStatuses } from "../../core/apiResultStatus/state";
import { Value } from "../../core/value/state";
import { Validation } from "../../core/validation/state";


export const ParentApi = {
  validateInputString: (_: Value<string>): Promise<Validation> => new Promise<Validation>((resolve, reject) => setTimeout(() => Math.random() > 0.2 ? resolve("valid") : reject(apiResultStatuses[2])))
};
