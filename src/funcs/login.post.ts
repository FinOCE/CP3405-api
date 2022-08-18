import PasswordManager from "../managers/PasswordManager"
import TokenManager from "../managers/TokenManager"
import Func, { HttpStatus } from "../models/Func"
import { UserProperties } from "../types/user"

export default class extends Func {
  public async run() {
    // Ensure the request contains a body
    if (!this.req.body)
      return this.respond(HttpStatus.BadRequest, {
        message: "No body provided in request"
      })

    // Validate request body
    const email = this.req.body.email
    if (!email)
      return this.respond(HttpStatus.BadRequest, {
        message: "No email provided"
      })

    const password = this.req.body.password
    if (!password)
      return this.respond(HttpStatus.BadRequest, {
        message: "No password provided"
      })

    // Hash the password
    const hashedPassword = PasswordManager.hash(password)

    // Find user
    const user = await this.query<UserProperties>(
      `g.V()
        .hasLabel('user')
        .has('email', '${email}')
        .has('password', '${hashedPassword}')
        .map(valueMap().unfold().group().by(keys).by(select(values).limit(local,1)))`
    ).then(res => res._items?.[0] as UserProperties | undefined)

    if (!user)
      return this.respond(HttpStatus.Forbidden, {
        message: "Could not find a user with given email and password"
      })

    // Create token and respond to function call with it
    const token = TokenManager.generate(user)
    return this.respond(HttpStatus.Ok, { token })
  }
}
