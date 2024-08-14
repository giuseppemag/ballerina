import { Template } from "@ballerina/core";
import { Uncle, UncleForeignMutationsExpected } from "../state";
import { Co } from "./builder";

export const UncleCoroutinesRunner: Template<Uncle, Uncle, UncleForeignMutationsExpected> = 
  Co.Template<UncleForeignMutationsExpected>(Co.Seq([]), { runFilter:props => false})
