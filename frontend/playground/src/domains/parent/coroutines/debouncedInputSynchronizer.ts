import { apiResultStatuses } from "ballerina-core";
import { Synchronize } from "ballerina-core";
import { Synchronized } from "ballerina-core";
import { Debounce } from "ballerina-core";
import { Value } from "ballerina-core";
import { ParentApi } from "../apis/mocks";
import { Parent } from "../state";
import { Validation } from "ballerina-core";
import { Co } from "./builder";


export const debouncedInputSynchronizer = Co.Repeat(
  (Debounce<Synchronized<Value<string>, Validation>>(
    Synchronize<Value<string>, Validation>(ParentApi.validateInputString,
      (_: any) => _ in apiResultStatuses ? _ : "permanent failure", 5, 150),
    250, 500).embed(
      parent => parent.inputString, Parent.Updaters.Core.inputString)
  ));
