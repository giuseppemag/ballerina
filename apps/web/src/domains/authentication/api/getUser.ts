import { faker } from '@faker-js/faker'
import { Http } from '@tenet/core-react'

import { ApiResultStatus, apiResultStatuses } from '@tenet/core'
import { User } from '../domains/entities/user'

export const getUser = () =>
  Http.mock<User, ApiResultStatus>(
    () => ({
      id: faker.string.uuid(),
      username: `${faker.person.firstName()} ${faker.person.lastName()}`,
    }),
    () => apiResultStatuses[2],
    0.8,
    0.1
  )
