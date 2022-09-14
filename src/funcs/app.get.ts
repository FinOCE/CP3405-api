import Func, { HttpStatus } from "../models/Func"

/**
 * Get apps recommended to the parent. If an appId is provided,
 * it only fetches info about that one app. NotFound only occurs
 * if searching with an appId and it isn't found.
 *
 * Route: GET /users/{parentId}/apps/{appId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent's child - No data
 * - BadRequest: The request was not valid - API.Error
 * - NotFound: Specific app could not be found - No data
 * - Ok: App successfully recommended - Noti.NewApp[]
 */
export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
