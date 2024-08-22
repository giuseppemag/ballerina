import { getUser } from './api/getUser'
import { User } from './domains/entities/user'

export type AuthenticationAPI = {
  getUser: () => Promise<User>
}

export const AuthenticationAPI: AuthenticationAPI = {
  getUser,
}
