import { apiResultStatuses } from "ballerina-core";
import { Synchronize } from "ballerina-core";
import { Synchronized } from "ballerina-core";
import { Debounce } from "ballerina-core";
import { Value } from "ballerina-core";
import { ParentApi } from "../apis/mocks";
import { Parent } from "../state";
import { ValidationResult } from "ballerina-core";
import { Co } from "./builder";


export const debouncedInputSynchronizer = Co.Repeat(
  (Debounce<Synchronized<Value<string>, ValidationResult>>(
    Synchronize<Value<string>, ValidationResult>(ParentApi.validateInputString,
      (_: any) => _ in apiResultStatuses ? _ : "permanent failure", 5, 150),
    250, 500).embed(
      parent => parent.inputString, Parent.Updaters.Core.inputString)
  ));
