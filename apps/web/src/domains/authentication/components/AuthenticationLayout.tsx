import React from 'react'
import { RenderMaybe } from '@tenet/core-react'

import { Authentication, AuthenticationView } from '../authentication.domain'

export const AuthenticationLayout: AuthenticationView = ({ context }) => {
  const user = React.useMemo(() => Authentication.Operations.getUser(context.user), [context.user])

  return (
    <main>
      <h1>Authentication</h1>
      <p>{JSON.stringify(context.user.response)}</p>

      <RenderMaybe maybe={user} onNothing={() => <>No user found</>} onJust={(user) => <p>{user.username}</p>} />
    </main>
  )
}
