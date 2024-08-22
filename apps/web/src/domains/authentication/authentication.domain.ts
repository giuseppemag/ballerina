import { AsyncState, ForeignMutationsInput, Maybe, propertyUpdater, unit, Unit, Updater } from '@tenet/core'
import { View } from '@tenet/core-react'

import { Queryable } from '../../lib/query'
import { User } from './domains/entities/user'

type Authentication = {
  user: Queryable<Unit, User>
}

const Authentication = {
  Default: (): Authentication => ({
    user: Queryable.Default.Loading(unit),
  }),

  Updaters: {
    Core: {
      user: propertyUpdater<Authentication>()('user'),
    },

    Template: {},

    Coroutine: {
      login: (user: User): Updater<Authentication> => {
        return Authentication.Updaters.Core.user(Queryable.Updaters.response(AsyncState.toLoaded(user)))
      },
    },
  },

  Operations: {
    getUser: (user: Authentication['user']): Maybe<User> =>
      AsyncState.isLoaded(user.response) ? Maybe.just(user.response.value) : Maybe.nothing(),
  },

  ForeignMutations: (input: ForeignMutationsInput<AuthenticationReadOnlyContext, AuthenticationWriteableState>) => ({
    // login: (user: User) => input.setState(Authentication.Updaters.Core.user((_) => AsyncState.Default.loaded(Option.Default.Full(user)))),
    // logout: () => input.setState(Authentication.Updaters.Core.user(replaceWith(AsyncState.Default.unloaded()))),
  }),
}

export type AuthenticationForeignMutationsExpected = Unit
export type AuthenticationForeignMutationsExposed = ReturnType<typeof Authentication.ForeignMutations>

export type AuthenticationReadOnlyContext = Unit
export type AuthenticationWriteableState = Authentication

export type AuthenticationView = View<
  AuthenticationReadOnlyContext & AuthenticationWriteableState,
  AuthenticationWriteableState,
  AuthenticationForeignMutationsExpected,
  {}
>

export { Authentication }
