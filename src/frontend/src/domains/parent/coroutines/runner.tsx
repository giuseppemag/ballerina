import { Synchronize } from "../../core/async/domains/synchronized/coroutines/synchronize";
import { Synchronized } from "../../core/async/domains/synchronized/state";
import { Debounce } from "../../core/debounced/coroutines/debounce";
import { Value } from "../../core/value/state";
import { InputStringValidation, Parent } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";

const debouncer =
  Co.Repeat(
    (Debounce<Synchronized<Value<string>, InputStringValidation>, never>(
      Synchronize<Value<string>, InputStringValidation, never>(() =>
        new Promise<InputStringValidation>(resolve => setTimeout(() => resolve("valid"))),
        (_: any) => "permanent", 5, 150),
      250, 500).embed(
        parent => parent.inputString, Parent.Updaters.Core.inputString)
    ))

export const ParentCoroutinesRunner =
  Co.Template(
    Co.Any([
      autoTickCounter,
      debouncer,
    ])
  )
