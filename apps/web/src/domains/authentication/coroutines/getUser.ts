import { Unit } from '@tenet/core'

import { Query } from '../../../lib/query'
import { AuthenticationAPI } from '../authentication.api'
import { Authentication } from '../authentication.domain'
import { User } from '../domains/entities/user'
import { Co } from './_builder'

export const getUserQuery = Co.Repeat(
  Query<Unit, User>(AuthenticationAPI.getUser).embed((auth) => auth.user, Authentication.Updaters.Core.user)
)
