import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"
import { UserProperties } from "../types/user"

/**
 * Add a child to a parent. This is called when an invite is accepted.
 *
 * Route: PUT /users/{parentId}/children/{childId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one who received the invite - No data
 * - BadRequest: The request was not valid - API.Error
 * - Ok: Invite successfully accepted - Noti.ChildRequestAccept[]
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

    // Check if there is an existing invite
    const exists = await this.query<number>(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasInvite')
          .not(
            has(
              'status',
              within(
                '${InviteStatus[InviteStatus.Rejected]}',
                '${InviteStatus[InviteStatus.Accepted]}'
              )
            )
          )
          .where(
            inV()
              .has('userId', '${childId}')
          )
        .count()
      `
    ).then(res => res._items[0] > 0)

    if (!exists)
      return this.respond(HttpStatus.BadRequest, {
        message: "No existing invite to accept"
      })

    // Create connection and mark status as accepted
    const res = await this.query<
      Vertex<Hide<UserProperties, "password" | "email">, "user">
    >(`
      g.V('${parentId}')
        .hasLabel('user')
        .as('parent')
      .V('${this.user.userId}')
        .hasLabel('user')
        .as('child')
      .addE('hasChild')
        .property('timestamp', ${Date.now()})
        .from('parent')
        .to('child')
      .V('${parentId}')
        .hasLabel('user')
      .outE('hasInvite')
        .not(
          has(
            'status',
            within(
              '${InviteStatus[InviteStatus.Rejected]}',
              '${InviteStatus[InviteStatus.Accepted]}'
            )
          )
        )
        .where(
            inV()
              .has('userId', '${childId}')
          )
        .property('status', '${InviteStatus[InviteStatus.Accepted]}')
      .inV()
    `)

    // Handle if the parent ID does not exist
    if (!res._items[0])
      return this.respond(HttpStatus.BadRequest, {
        message: "Invalid parent ID provided"
      })

    // Remove properties that shouldn't be sent
    for (const child of res._items) {
      delete child.properties.password
      delete child.properties.email
    }

    // Send notification for new child to parent
    await this.query(`
      g.V('${parentId}')
        .as('parent')
      .V('${childId}')
        .as('child')
      .addE('hasNotification')
        .property('type', 'childRequestAccept')
        .property('timestamp', ${Date.now()})
        .property('viewed', false)
        .from('child')
        .to('parent')
    `)

    // Respond to request
    return this.respond(
      HttpStatus.Ok,
      res._items.map(child => ({ type: "childRequestAccept", child }))
    )
  }
}
