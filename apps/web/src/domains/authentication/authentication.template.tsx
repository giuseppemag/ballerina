import { Template } from '@tenet/core-react'

import {
  AuthenticationForeignMutationsExpected,
  AuthenticationReadOnlyContext,
  AuthenticationView,
  AuthenticationWriteableState,
} from './authentication.domain'

import { AuthenticationGetUserRunner } from './coroutines/_runners'

export const AuthenticationTemplate = Template.Default<
  AuthenticationReadOnlyContext,
  AuthenticationWriteableState,
  AuthenticationForeignMutationsExpected,
  AuthenticationView
>((props) => {
  return <props.view {...props} />
}).any([AuthenticationGetUserRunner])
