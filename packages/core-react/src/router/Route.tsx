import React from 'react'

import { RouterContext } from './RouterContext'
import { matchPath } from './match-path'

export interface RouteProps<TParams extends Record<string, string>> {
  path: string
  component: React.ComponentType<{ params: TParams }>
}

export const Route = <TParams extends Record<string, string>>({ path, component: Component }: RouteProps<TParams>) => {
  const { path: currentPath } = React.useContext(RouterContext)!

  const match = React.useMemo(() => {
    return matchPath<TParams>(path, currentPath)
  }, [path, currentPath])

  if (match) {
    return <Component params={match.params} />
  }

  return null
}
