import { Roles } from "../models/User"

export type UserProperties = {
  userId: string
  firstName: string
  lastName: string
  role: keyof typeof Roles
}
