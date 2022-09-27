import Func, { HttpStatus } from "../models/Func"
import Notification from "../models/Notification"

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
 * - Ok: Child successfully removed - Noti.childRemove[]
 */
export default class extends Func {
  public async run() {
    // Get route parameters
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    if (!childId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing child ID in route"
      })

    // Ensure user is logged in and is the parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (this.user.userId !== parentId) return this.respond(HttpStatus.Forbidden)

    // Remove connection in database
    await this.query(`
      g.V('${parentId}')
        .hasLabel('user')
      .outE('hasChild')
        .where(
          inV()
            .has('userId', '${childId}')
        )
        .drop()
    `)

    // Create notification
    const notification = await this.query<
      EdgeAndVertex<Noti.Base, any, "hasNotification", string>
    >(
      `
        g.V('${parentId}')
          .as('parent')
        .V('${childId}')
          .as('vertex')
        .addE('hasNotification')
          .property('type', 'childRemove')
          .property('timestamp', ${Date.now()})
          .property('viewed', false)
          .from('vertex')
          .to('parent')
          .as('edge')
        .select('edge', 'vertex')
      `
    ).then(res => res._items.map(noti => Notification.generate(noti)))

    // Respond to the func call
    return this.respond(HttpStatus.Ok, notification)
  }
}
