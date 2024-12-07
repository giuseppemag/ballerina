import { ApiResultStatus } from "../../apiResultStatus/state";
import { CoTypedFactory } from "../../coroutines/builder";
import { Coroutine } from "../../coroutines/state";
import { Unit } from "../../fun/domains/unit/state";
import { replaceWith } from "../../fun/domains/updater/domains/replaceWith/state";
import { Debounced, DebouncedStatus, DirtyStatus } from "../state";


export const Debounce = <value, context = Unit>(
  k: Coroutine<value & context, value, ApiResultStatus>,
  debounceDurationInMs: number,
  waitBeforeRetryOnTransientFailure: number = debounceDurationInMs * 2
) => {
  const Co = CoTypedFactory<context, Debounced<value>>();
  const updaters = Debounced.Updaters;
  return Co.Seq([
    Co.SetState(
      updaters.Core.status(replaceWith<DebouncedStatus>("waiting for dirty"))
    ),
    Co.While(
      ([current]) =>
        current.dirty != "dirty" ||
        Date.now() - current.lastUpdated <= debounceDurationInMs,
      Co.Wait(debounceDurationInMs / 5)
    ),
    Co.SetState(
      updaters.Core.dirty(replaceWith<DirtyStatus>("dirty but being processed"))
    ),
    Co.GetState().then((current) => {
      if (current.status.kind == "l") {
        return Co.SetState(
          updaters.Core.status(
            replaceWith<DebouncedStatus>(
              "just detected dirty, starting processing"
            )
          )
        );
      }
      else return Co.Do(() => {});
    }),
    Co.Any([
      // shortcircuit the validation if it takes longer than the whole cycle in the presence of an underwater update of the field
      Co.Seq([
        Co.While(
          ([current]) =>
            current.dirty != "dirty" ||
            Date.now() - current.lastUpdated <= debounceDurationInMs,
          Co.Wait(debounceDurationInMs / 5)
        ),
        Co.GetState().then((current) => {
          if (current.status.kind == "l") {
            return Co.SetState(
              updaters.Core.status(
                replaceWith<DebouncedStatus>(
                  "processing shortcircuited"
                )
              )
            );
          }
          else return Co.Do(() => {});
        }),
        Co.Wait(debounceDurationInMs / 2),
      ]),
      k
        .embed((_: Debounced<value & context>) => _, updaters.Core.value)
        .then((apiResult) => {
          return Co.Seq([
            Co.GetState().then((current) => {
              if (current.status.kind == "l") {
                return Co.SetState(
                  updaters.Core.status(
                    replaceWith<DebouncedStatus>(
                      "processing finished"
                    )
                  )
                );
              }
              else return Co.Do(() => {});
            }),
            // Co.Wait(250)
          ]).then(() => {
            return Co.GetState().then((current) => {
              // alert(apiResult)
              if (apiResult == "success" || apiResult == "permanent failure") {
                // maybe a new change has already reset dirty, in that case we need to start all over again
                if (current.dirty == "dirty but being processed") {
                  return Co.Seq([
                    Co.GetState().then((current) => {
                      if (current.status.kind == "l") {
                        return Co.SetState(
                          updaters.Core.status(
                            replaceWith<DebouncedStatus>(
                              "state was still dirty but being processed, resetting to not dirty"
                            )
                          )
                        );
                      }
                      else return Co.Do(() => {});
                    }),
                    // use UpdateState to make sure that we look up the state at the last possible moment to account for delays
                    Co.UpdateState((state) =>
                      state.dirty == "dirty but being processed"
                        ? updaters.Core.dirty(
                            replaceWith<DirtyStatus>("not dirty")
                          )
                        : updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))
                    ),
                  ]);
                } else {
                  return Co.Seq([
                    Co.GetState().then((current) => {
                      if (current.status.kind == "l") {
                        return Co.SetState(
                          updaters.Core.status(
                            replaceWith<DebouncedStatus>(
                               "state was changed underwater back to dirty, leaving the dirty flag alone"
                            )
                          )
                        );
                      }
                      else return Co.Do(() => {});
                    }),
                    Co.SetState(
                      updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))
                    ),
                    // Co.Wait(250)
                  ]);
                }
              } else {
                return Co.Seq([
                  Co.GetState().then((current) => {
                    if (current.status.kind == "l") {
                      return Co.SetState(
                        updaters.Core.status(
                          replaceWith<DebouncedStatus>(
                             "inner call failed with transient failure"
                          )
                        )
                      );
                    }
                    else return Co.Do(() => {});
                  }),
                  Co.SetState(
                    updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))
                  ),
                  Co.Wait(waitBeforeRetryOnTransientFailure),
                ]);
              }
            });
          });
        }),
    ]),
  ]);
};
