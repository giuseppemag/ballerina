import { apiResultStatuses } from "../../core/apiResultStatus/state";
import { Value } from "../../core/value/state";
import { InputStringValidation } from "../state";


export const ParentApi = {
  validateInputString: (_: Value<string>): Promise<InputStringValidation> => new Promise<InputStringValidation>((resolve, reject) => setTimeout(() => Math.random() > 0.2 ? resolve("valid") : reject(apiResultStatuses[2])))
};
