import { Coroutine, Unit, CoroutineStep, CoTypedFactory, IntegratedFormState, IntegratedFormContext, IntegratedFormRunnerContext, IntegratedFormRunnerState, unit, replaceWith } from "ballerina-core";

export const Patcher = <E>() => {
    const Co = CoTypedFactory<IntegratedFormRunnerContext<E>, IntegratedFormRunnerState<E>>()

   const patcher = Co.GetState().then((current) => {
    if(current.form.kind == "r" || current.entity.kind == "r") {
        return Co.SetState(IntegratedFormRunnerState<E>().Updaters.shouldUpdate(replaceWith(false))).then(() => 
            Co.Return(unit)
        )
    }
    const patch = current.form.value.toApiParser(current.entity.value, current.form.value, false)
    if(patch.kind == "errors") {
        console.error(patch.errors)
        return Co.SetState(IntegratedFormRunnerState<E>().Updaters.shouldUpdate(replaceWith(false))).then(() => 
            Co.Return(unit)
        )
    } else {
        console.log("patching", patch.value)
        return Co.SetState(IntegratedFormRunnerState<E>().Updaters.shouldUpdate(replaceWith(false))).then(() => 
            Co.Return(unit)
        )
    }
   })

   return Co.Template<Unit>(patcher, {
    interval: 100,
    runFilter: (props) => {
        return props.context.shouldUpdate
    }
   })
}