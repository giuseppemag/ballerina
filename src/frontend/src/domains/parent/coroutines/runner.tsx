import { ApiResultStatus } from "../../core/apiResultStatus/state";
import { Synchronize } from "../../core/async/domains/synchronized/coroutines/synchronize";
import { Synchronized } from "../../core/async/domains/synchronized/state";
import { CoTypedFactory } from "../../core/coroutines/builder";
import { Debounce } from "../../core/debounced/coroutines/debounce";
import { Unit } from "../../core/fun/domains/unit/state";
import { Value } from "../../core/value/state";
import { InputStringValidation, Parent, ParentReadonlyContext, ParentWritableState } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";

const CoD = CoTypedFactory<Unit, Parent["inputString"], never>()
const CoS = CoTypedFactory<Unit, Synchronized<Value<string>, InputStringValidation>, never>();

const debouncer = 
  Co.Repeat(
    CoD.Embed<ParentReadonlyContext, ParentWritableState, Unit, never>
      (Debounce<Synchronized<Value<string>, InputStringValidation>, never>(
        Synchronize<Value<string>, InputStringValidation, never>(() => 
          new Promise<InputStringValidation>(resolve => setTimeout(() => resolve("valid"))), 
          (_:any) => "permanent", 5, 150).then(_ => CoS.Return<ApiResultStatus>("success")), 
        250, 500),
      parent => parent.inputString, Parent.Updaters.Core.inputString)
  )

export const ParentCoroutinesRunner = 
  Co.Template(
    Co.Any([
      autoTickCounter,
      debouncer,
    ])
  )
