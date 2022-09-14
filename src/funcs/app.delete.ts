import Func, { HttpStatus } from "../models/Func"

/**
 * Remove an app from a parent. Called when an app is removed.
 *
 * Route: DELETE /users/{parentId}/apps/{appId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent's child - No data
 * - BadRequest: The request was not valid - API.Error
 * - NoContent: App successfully removed - No datda
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
