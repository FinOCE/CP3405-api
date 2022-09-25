import Func, { HttpStatus } from "../models/Func"

/**
 * Remove a child from the parent
 *
 * Route: GET /users/{parentId}/children/{childId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent - No data
 * - BadRequest: Child ID was not provided - No data
 * - Ok: Child successfully removed - Noti.childRemove[] // TODO: Create notification for when child is removed
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
