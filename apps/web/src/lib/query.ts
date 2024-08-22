import { ApiResultStatus, AsyncState, BasicUpdater, id, Unit, Updater } from '@tenet/core'
import { Coroutine, CoTypedFactory } from '@tenet/core-react'

export type Queryable<Payload, Response> = { payload: Payload; response: AsyncState<Response> }

export const Queryable = {
  Default: {
    Unloaded: <Payload, Response>(initialPayload: Payload): Queryable<Payload, Response> => ({
      payload: initialPayload,
      response: AsyncState.unloaded(),
    }),
    Loading: <Payload, Response>(initialPayload: Payload): Queryable<Payload, Response> => ({
      payload: initialPayload,
      response: AsyncState.loading(),
    }),
  },
  Updaters: {
    response: <Payload, Response>(updater: BasicUpdater<AsyncState<Response>>): Updater<Queryable<Payload, Response>> =>
      Updater((curr) => ({
        ...curr,
        response: updater(curr.response),
      })),
  },
}

export const Query = <Payload, Response>(
  queryFn: (payload: Payload) => Promise<Response>,
  maxRetries: number = 3,
  delayBetweenRetries: number = 150
): Coroutine<Queryable<Payload, Response>, Queryable<Payload, Response>, ApiResultStatus> => {
  const Co = CoTypedFactory<Unit, Queryable<Payload, Response>>()

  return Co.GetState().then((currentState) =>
    Co.Await(() => queryFn(currentState.payload), id).then((response) => {
      if (response.tag === 'right') {
        return Co.SetState(Queryable.Updaters.response(AsyncState.toLoaded(response.value))).then(() =>
          Co.Return<ApiResultStatus>('success')
        )
      } else if (maxRetries > 0) {
        return Co.Wait(delayBetweenRetries).then(() => Query(queryFn, maxRetries - 1, delayBetweenRetries))
      } else {
        return Co.SetState(Queryable.Updaters.response(AsyncState.toFailed(response.value))).then(() =>
          Co.Return<ApiResultStatus>('permanent failure')
        )
      }
    })
  )
}
