import Func, { HttpStatus } from "../models/Func"
import Notification from "../models/Notification"

/**
 * Remove a parent from the child
 *
 * Route: GET /users/{childId}/parents/{parentId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the child - No data
 * - BadRequest: Parent ID was not provided - API.Error
 * - Ok: Parent successfully removed - Noti.parentRemove[]
 */
export default class extends Func {
  public async run() {
    // Get route parameters
    const childId: string = this.context.bindingData.childId
    const parentId: string | undefined = this.context.bindingData.parentId

    if (!parentId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing parent ID in route"
      })

    // Ensure user is logged in and is the parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (this.user.userId !== childId) return this.respond(HttpStatus.Forbidden)

    // Remove connection in database
    await this.query(`
      g.V('${childId}')
        .hasLabel('user')
      .inE('hasChild')
        .where(
          outV()
            .has('userId', '${parentId}')
        )
        .drop()
    `)

    // Create notification
    const notification = await this.query<
      EdgeAndVertex<Noti.Base, any, "hasNotification", string>
    >(
      `
        g.V('${childId}')
          .as('child')
        .V('${parentId}')
          .as('vertex')
        .addE('hasNotification')
          .property('type', 'parentRemove')
          .property('timestamp', ${Date.now()})
          .property('viewed', false)
          .from('vertex')
          .to('child')
          .as('edge')
        .select('edge', 'vertex')
      `
    ).then(res => res._items.map(noti => Notification.generate(noti)))

    // Respond to the func call
    return this.respond(HttpStatus.Ok, notification)
  }
}
