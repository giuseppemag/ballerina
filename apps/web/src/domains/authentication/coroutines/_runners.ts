import { AuthenticationForeignMutationsExpected } from '../authentication.domain'

import { Co } from './_builder'
import { getUserQuery } from './getUser'

export const AuthenticationGetUserRunner = Co.Template<AuthenticationForeignMutationsExpected>(getUserQuery, {
  interval: 5,
  runFilter: (props) => props.context.user.response.kind === 'loading',
})
