import { Roles } from "../models/User"

export type UserProperties = {
  userId: string
  email: string
  password: string
  firstName: string
  lastName: string
  nickName: string
  timestamp: number
  role?: keyof typeof Roles
}
