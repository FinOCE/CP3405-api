import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch all of a parent's children or just a specific one.
 *
 * Route: GET /users/{parentId}/children/{childId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent or child - No data
 * - NotFound: Specific child could not be found - No data
 * - Ok: Child(ren) successfully fetched - Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
