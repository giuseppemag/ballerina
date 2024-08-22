import * as React from 'react'

import { RouterContext } from './RouterContext'

export function useRouter() {
  const routerContext = React.useContext(RouterContext)

  if (!routerContext) {
    throw new Error('useRouter must be used within <Router />')
  }

  return routerContext
}
