import Func, { HttpStatus } from "../models/Func"
import Notification from "../models/Notification"
import { UserProperties } from "../types/user"

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
 * - NoContent: App successfully removed - Noti.AppRemove[]
 */
export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const appId: string | undefined = this.context.bindingData.appId

    if (!appId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing app ID in route"
      })

    // Check that the user is a child of the parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)

    const child = await this.query<Vertex<UserProperties, "user"> | undefined>(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasChild')
          .where(
            inV()
              .has('userId', '${this.user.userId}')
          )
        .inV()
      `
    ).then(res => res._items[0])

    if (!child) return this.respond(HttpStatus.Forbidden)

    // Delete app connection
    await this.query(`
      g.V()
        .hasLabel('user')
        .has('userId', '${parentId}')
      .outE('hasApp')
        .where(
          inV()
            .has('appId', '${appId}')
        )
        .drop()
    `)

    // Send notification for app being removed to parent
    const notification = await this.query<
      EdgeAndVertex<Noti.Base, any, "hasNotification", string>
    >(
      `
        g.V('${appId}')
          .as('app')
        .V('${parentId}')
          .as('vertex')
        .addE('hasNotification')
          .property('type', 'appRemove')
          .property('timestamp', ${Date.now()})
          .property('viewed', false)
          .from('vertex')
          .to('app')
          .as('edge')
        .select('edge', 'vertex')
      `
    ).then(res => res._items.map(noti => Notification.generate(noti)))

    // Respond to request
    return this.respond(HttpStatus.Ok, notification)
  }
}
