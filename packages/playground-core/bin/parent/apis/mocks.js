import { apiResultStatuses } from "@ballerina/core";
import { PromiseRepo } from "@ballerina/core";
export const ParentApi = {
    validateInputString: (_) => PromiseRepo.Default.mock(() => Math.random() > 0.9 ? "valid" : ({ kind: "error", errors: ["validation error 1", "validation error 2"] }), () => apiResultStatuses[2], 0.8, 0.2)
};
//# sourceMappingURL=mocks.js.map