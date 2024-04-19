import { apiResultStatuses } from "../../core/apiResultStatus/state";
import { Synchronize } from "../../core/async/domains/synchronized/coroutines/synchronize";
import { Synchronized } from "../../core/async/domains/synchronized/state";
import { Debounce } from "../../core/debounced/coroutines/debounce";
import { Unit } from "../../core/fun/domains/unit/state";
import { Template, TemplateProps } from "../../core/template/state";
import { Value } from "../../core/value/state";
import { ParentApi } from "../apis/validation";
import { InputStringValidation, Parent } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";

export const ParentDebouncerRunner = Template.Default((props: TemplateProps<Parent & { events: Array<never> }, Parent, Unit>) =>
  props.context.inputString.dirty != "not dirty" ?
    <>
      {
        Co.Template(
          Co.Repeat(
            (Debounce<Synchronized<Value<string>, InputStringValidation>, never>(
              Synchronize<Value<string>, InputStringValidation, never>(ParentApi.validateInputString,
                (_: any) => _ in apiResultStatuses ? _ : "permanent failure", 5, 150),
              250, 500).embed(
                parent => parent.inputString, Parent.Updaters.Core.inputString)
            ))
        )(props)
      }
    </>
    : <></>
)

export const ParentCoroutinesRunner =
  Co.Template(
    Co.Any([
      autoTickCounter,
    ])
  )
