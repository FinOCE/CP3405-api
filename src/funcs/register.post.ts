import Func, { HttpStatus } from "../models/Func"
import { validate } from "email-validator"
import { UserProperties } from "../types/user"
import PasswordManager from "../managers/PasswordManager"
import TokenManager from "../managers/TokenManager"
import short from "short-uuid"

export default class extends Func {
  public async run() {
    // Ensure the request contains a body
    if (!this.req.body)
      return this.respond(HttpStatus.BadRequest, {
        message: "No body provided in request"
      })

    // Validate request email
    const email = this.req.body.email as string
    if (!email)
      return this.respond(HttpStatus.BadRequest, {
        message: "No email provided"
      })
    else if (!validate(email)) {
      return this.respond(HttpStatus.BadRequest, {
        message: "Invalid email provided"
      })
    }

    // Validate request password
    const password = this.req.body.password as string
    if (!password)
      return this.respond(HttpStatus.BadRequest, {
        message: "No password provided"
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
        message: "No first name provided"
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
        message: "No last name provided"
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
        message: "No nickname provided"
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
        message: "The provided email is already in use"
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
