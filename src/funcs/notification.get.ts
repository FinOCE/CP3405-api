import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch a user's notifications. Notifications will only show if they are less
 * than two weeks old.
 *
 * Route: GET /users/{userId}/notifications/all     - All notifications
 *        GET /users/{userId}/notifications/unread  - Only unread notifications
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one whose notifiactions are requested - No data
 * - NotFound: If an invalid route is provided (not all/unread, should be impossible) - No data
 * - Ok: Returns all notifications - Noti.Unknown[]
 */
export default class extends Func {
  public async run() {
    const userId: string = this.context.bindingData.userId

    if (this.context.bindingData.type === "all") {
      // All notifications function
      const address = this.req.url.split("/").slice(0, 3).join("/")
      console.log(address)
      return this.respond(HttpStatus.NotImplemented)
    } else if (this.context.bindingData.type === "unread") {
      // Unread notifications function
      return this.respond(HttpStatus.NotImplemented)
    } else {
      // Invalid call (this should not be possible)
      return this.respond(HttpStatus.NotFound)
    }
  }
}
