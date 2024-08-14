import { CoTypedFactory } from "../../coroutines/builder";
import { replaceWith } from "../../fun/domains/updater/domains/replaceWith/state";
import { Debounced } from "../state";
export const Debounce = (k, debounceDurationInMs, waitBeforeRetryOnTransientFailure = debounceDurationInMs * 2) => {
    const Co = CoTypedFactory();
    const updaters = Debounced.Updaters;
    return Co.Seq([
        Co.SetState(updaters.Core.status(replaceWith("waiting for dirty"))),
        Co.While(([current]) => current.dirty != "dirty" || Date.now() - current.lastUpdated <= debounceDurationInMs, Co.Wait(debounceDurationInMs / 5)),
        Co.SetState(updaters.Core.dirty(replaceWith("dirty but being processed"))),
        Co.SetState(updaters.Core.status(replaceWith("just detected dirty, starting processing"))),
        Co.Any([
            // shortcircuit the validation if it takes longer than the whole cycle in the presence of an underwater update of the field
            Co.Seq([
                Co.While(([current]) => current.dirty != "dirty" || Date.now() - current.lastUpdated <= debounceDurationInMs, Co.Wait(debounceDurationInMs / 5)),
                Co.SetState(updaters.Core.status(replaceWith("processing shortcircuited"))),
                Co.Wait(debounceDurationInMs / 2)
            ]),
            k.embed((_) => _, updaters.Core.value).then(apiResult => {
                return Co.Seq([
                    Co.SetState(updaters.Core.status(replaceWith("processing finished"))),
                    // Co.Wait(250)
                ]).then(() => {
                    return Co.GetState().then(current => {
                        // alert(apiResult)
                        if (apiResult == "success" || apiResult == "permanent failure") {
                            // maybe a new change has already reset dirty, in that case we need to start all over again
                            if (current.dirty == "dirty but being processed") {
                                return Co.Seq([
                                    Co.SetState(updaters.Core.status(replaceWith("state was still dirty but being processed, resetting to not dirty"))),
                                    // use UpdateState to make sure that we look up the state at the last possible moment to account for delays
                                    Co.UpdateState(state => state.dirty == "dirty but being processed" ?
                                        updaters.Core.dirty(replaceWith("not dirty"))
                                        : updaters.Core.dirty(replaceWith("dirty"))),
                                ]);
                            }
                            else {
                                return Co.Seq([
                                    Co.SetState(updaters.Core.status(replaceWith("state was changed underwater back to dirty, leaving the dirty flag alone"))),
                                    Co.SetState(updaters.Core.dirty(replaceWith("dirty"))),
                                    // Co.Wait(250)
                                ]);
                            }
                        }
                        else {
                            return Co.Seq([
                                Co.SetState(updaters.Core.status(replaceWith("inner call failed with transient failure"))),
                                Co.SetState(updaters.Core.dirty(replaceWith("dirty"))),
                                Co.Wait(waitBeforeRetryOnTransientFailure)
                            ]);
                        }
                    });
                });
            })
        ])
    ]);
};
//# sourceMappingURL=debounce.js.map