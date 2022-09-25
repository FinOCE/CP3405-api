import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch all of a child's parents or just a specific one.
 *
 * Route: GET /users/{childId}/parents/{parentId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent or child - No data
 * - NotFound: Specific parent could not be found - No data
 * - Ok: Parent(s) successfully fetched - Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
