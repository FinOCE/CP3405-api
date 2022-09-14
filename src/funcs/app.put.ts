import Func, { HttpStatus } from "../models/Func"

/**
 * Add an app to a parent. Called when an app is sent
 *
 * Route: PUT /users/{parentId}/apps/{appId}
 * Body: TBD
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent's child - No data
 * - BadRequest: The request was not valid - API.Error
 * - Ok: App successfully recommended - Noti.NewApp[]
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
