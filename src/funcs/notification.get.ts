import Func, { HttpStatus } from "../models/Func"
import Notification from "../models/Notification"

/**
 * Fetch a user's notifications. Notifications will only show if they are less
 * than two weeks old.
 *
 * Route: GET /users/{userId}/notifications
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one whose notifiactions are requested - No data
 * - Ok: Returns all notifications - Noti.Unknown[]
 */
export default class extends Func {
  public async run() {
    // Validate the user is fetching their own notifications
    const userId: string = this.context.bindingData.userId

    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (this.user?.userId !== userId) return this.respond(HttpStatus.Forbidden)

    // Fetch all notifications
    const notifications: Noti.Unknown[] = await this.query<
      EdgeAndVertex<Noti.Base, any, "hasNotification", string>
    >(
      `
        g.V('${userId}')
          .hasLabel('user')
        .outE('hasNotification')
          .as('edge')
        .inV()
          .as('vertex')
        .select('edge', 'vertex')
      `
    ).then(res => res._items.map(noti => Notification.generate(noti)))

    // Respond to the function call
    return this.respond(HttpStatus.Ok, notifications)
  }
}
