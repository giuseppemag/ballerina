import { CoTypedFactory } from '@tenet/core-react'

import { AuthenticationReadOnlyContext, AuthenticationWriteableState } from '../authentication.domain'

export const Co = CoTypedFactory<AuthenticationReadOnlyContext, AuthenticationWriteableState>()
