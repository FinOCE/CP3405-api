import Func, { HttpStatus } from "../models/Func"
import { validate } from "email-validator"
import { UserProperties } from "../types/user"
import PasswordManager from "../managers/PasswordManager"
import TokenManager from "../managers/TokenManager"
import short from "short-uuid"

export default class extends Func {
  public async run() {
    // Validate request email
    const email = this.req.body.email as string
    if (!email)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing email in body"
      })
    else if (!validate(email)) {
      return this.respond(HttpStatus.BadRequest, {
        message: "Invalid email in body"
      })
    }

    // Validate request password
    const password = this.req.body.password as string
    if (!password)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing password in body"
      })
    else if (!PasswordManager.validate(password)) {
      return this.respond(HttpStatus.BadRequest, {
        message:
          "Password must be 8-64 characters long, with uppercase and lowercase letters and at least 2 digits"
      })
    }

    const hashedPassword = PasswordManager.hash(password)

    // Validate request first name
    const firstName = this.req.body.firstName as string
    if (!firstName)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing first name in body"
      })
    else if (
      firstName.length <= 0 ||
      firstName.length > 64 ||
      firstName.includes("'")
    )
      return this.respond(HttpStatus.BadRequest, {
        message: "First name cannot be greater than 64 characters"
      })

    // Validate request last name
    const lastName = this.req.body.lastName as string
    if (!lastName)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing last name in body"
      })
    else if (
      lastName.length <= 0 ||
      lastName.length > 64 ||
      lastName.includes("'")
    )
      return this.respond(HttpStatus.BadRequest, {
        message: "Last name cannot be greater than 64 characters"
      })

    // Validate request nickname
    const nickName = this.req.body.nickName as string
    if (!nickName)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing nick name in body"
      })
    else if (
      nickName.length <= 0 ||
      nickName.length > 64 ||
      nickName.includes("'")
    )
      return this.respond(HttpStatus.BadRequest, {
        message: "Nick name cannot be greater than 64 characters"
      })

    // Check if account already exists with the email
    const exists = await this.query(
      `g.V()
        .hasLabel('user')
        .has('email', '${email}')`
    ).then(res => res.length !== 0)

    if (exists)
      return this.respond(HttpStatus.Conflict, {
        message: "Account with given email already exists"
      })

    // Create account
    const id = short().generate()

    const user = await this.query<UserProperties>(
      `g.addV('user')
        .property('id', '${id}')
        .property('userId', '${id}')
        .property('email', '${email}')
        .property('password', '${hashedPassword}')
        .property('firstName', '${firstName}')
        .property('lastName', '${lastName}')
        .property('nickName', '${nickName}')
        .map(valueMap().unfold().group().by(keys).by(select(values).limit(local,1)))`
    ).then(res => res._items[0])

    // Create token and respond to function call with it
    const token = TokenManager.generate(user)
    return this.respond(HttpStatus.Ok, { token })
  }
}
