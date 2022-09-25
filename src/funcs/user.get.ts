import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch users whose name matches a given search phrase
 *
 * Route: GET /users/{id?}
 * Body: {
 *  text: string
 * }
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - NotFound: Specific user could not be found
 * - Ok: Parent successfully removed - API.Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
