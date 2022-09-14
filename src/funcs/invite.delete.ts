import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"
import { UserProperties } from "../types/user"

/**
 * Decline a child invite. This is called when an invite is declined.
 *
 * Route: DELETE /users/{parentId}/invites/{childId}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one who received the invite - No data
 * - BadRequest: The request was not valid - API.Error
 * - Ok: Invite successfully declined - Noti.ChildRequestDecline[]
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

    // Ensure user is logged in and is the child or parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (![parentId, childId].includes(this.user.userId))
      return this.respond(HttpStatus.Forbidden)

    // Submit query
    const res = await this.query<
      Vertex<Hide<UserProperties, "password" | "email">, "user">
    >(`
      g.V('${parentId}')
        .hasLabel('user')
      .outE('hasInvite')
        .where(
          inV()
            .has('userId', '${childId}')
        )
        .property('status', '${InviteStatus[InviteStatus.Rejected]}')
      .inV()
    `)

    // Remove properties that shouldn't be sent
    for (const child of res._items) {
      delete child.properties.password
      delete child.properties.email
    }

    // Respond to request
    return this.respond(
      HttpStatus.Ok,
      res._items.map(child => ({ type: "childRequestDecline", child }))
    )
  }
}
