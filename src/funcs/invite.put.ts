import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"
import { UserProperties } from "../types/user"

/**
 * Create an invite. This is called when an invite is sent.
 *
 * Route: PUT /users/{parentId}/invites/{childId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one who the invite is sent from - No data
 * - BadRequest: The request was not valid - API.Error
 * - Ok: Invite successfully sent - Noti.ChildRequest[]
 */
export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    if (!childId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing child ID in route"
      })

    // Ensure user is logged in and request is made by the child
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (this.user.userId !== childId) this.respond(HttpStatus.Forbidden)

    // Create invite
    const res = await this.query<
      Vertex<Hide<UserProperties, "password" | "email">, "user">
    >(`
      g.V('${parentId}')
        .hasLabel('user')
        .as('parent')
      .V('${childId}')
        .hasLabel('user')
        .as('child')
      .addE('hasInvite')
        .property('status', '${InviteStatus[InviteStatus.Pending]}')
        .property('timestamp', ${Date.now()})
        .from('parent')
        .to('child')
      .V('${childId}')
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

    // Respond to request
    return this.respond(
      HttpStatus.Ok,
      res._items.map(child => ({ type: "childRequest", child }))
    )
  }
}
