import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch user with a given ID or email
 *
 * Route: GET /users/{id} or /users?email=???
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - BadRequest: Missing email or user ID (or has both) - API.Error
 * - NotFound: Specific user could not be found - No data
 * - Ok: User found - API.Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    // Validate request
    const userId: string | undefined = this.context.bindingData.id
    const email: string | undefined = this.req.query.email

    console.log(userId, email)

    if (!email && !userId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Request must contain either email param or ID in route"
      })

    if (email && userId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Request cannot contain both a user ID and email"
      })

    if (!this.user) return this.respond(HttpStatus.Unauthorized)

    // Fetch user from database
    const users = await this.query<
      Vertex<Hide<User, "password" | "email">, "user">
    >(
      userId
        ? `
          g.V('${userId}')
            .hasLabel('user')
        `
        : `
          g.V()
            .hasLabel('user')
            .has('email', '${email}')
        `
    ).then(res => res._items)

    if (users.length === 0) return this.respond(HttpStatus.NotFound)

    // Remove properties that shouldn't be sent
    for (const user of users) {
      delete user.properties.password
      delete user.properties.email
    }

    // Respond to func call
    return this.respond(HttpStatus.Ok, users)
  }
}
