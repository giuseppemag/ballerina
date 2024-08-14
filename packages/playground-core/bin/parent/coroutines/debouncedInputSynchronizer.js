import { apiResultStatuses } from "@ballerina/core";
import { Synchronize } from "@ballerina/core";
import { Debounce } from "@ballerina/core";
import { ParentApi } from "../apis/mocks";
import { Parent } from "../state";
import { Co } from "./builder";
export const debouncedInputSynchronizer = Co.Repeat((Debounce(Synchronize(ParentApi.validateInputString, (_) => _ in apiResultStatuses ? _ : "permanent failure", 5, 150), 250, 500).embed(parent => parent.inputString, Parent.Updaters.Core.inputString)));
//# sourceMappingURL=debouncedInputSynchronizer.js.map