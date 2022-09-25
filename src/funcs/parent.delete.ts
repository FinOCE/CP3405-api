import Func, { HttpStatus } from "../models/Func"

/**
 * Remove a parent from the child
 *
 * Route: GET /users/{childId}/parents/{parentId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the child - No data
 * - BadRequest: Parent ID was not provided - No data
 * - Ok: Parent successfully removed - Noti.parentRemove[] // TODO: Create notification for when parent is removed
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
