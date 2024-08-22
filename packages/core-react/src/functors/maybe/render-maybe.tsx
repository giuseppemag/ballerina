import { BasicFunc, Maybe, Unit } from '@tenet/core'
import React from 'react'

export type RenderMaybeProps<A> = {
  maybe: Maybe<A>
  onNothing?: () => React.ReactNode
  onJust: (_: A) => React.ReactNode
}

export const RenderMaybe = <A,>({ maybe, onNothing, onJust }: RenderMaybeProps<A>): React.ReactNode => {
  const Component = React.useMemo(() => {
    return Maybe.match<A, React.ReactNode>(onNothing ? onNothing : () => <></>, onJust)(maybe)
  }, [maybe, onNothing, onJust])

  return Component
}
