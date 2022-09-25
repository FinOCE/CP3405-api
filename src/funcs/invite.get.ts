import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"
import { UserProperties } from "../types/user"

/**
 * Fetch existing invites. This finds all pending invites. If no childId is
 * provided in the route, it fetches all pending, otherwise it only gets that
 * specific one. NotFound only occurs if searching with a childId and it isn't
 * found.
 *
 * Route: GET /users/{parentId}/children/{childId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not the one who received the invites - No data
 * - NotFound: Specific child invite could not be found - No data
 * - Ok: Successfully fetched the invites: API.Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    // Get route parameters
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    // Ensure user is logged in and is the parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (this.user.userId !== parentId) return this.respond(HttpStatus.Forbidden)

    // Fetch invite
    const res = await this.query<
      Vertex<Hide<UserProperties, "password" | "email">, "user">
    >(`
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
      .inV()
        ${!childId ? "" : `.has('userId', '${childId}')`}
    `)

    // Return not found if specific searched for but doesn't exist
    if (childId && res._items.length === 0)
      return this.respond(HttpStatus.NotFound)

    // Remove properties that shouldn't be sent
    for (const child of res._items) {
      delete child.properties.password
      delete child.properties.email
    }

    // Respond to request
    return this.respond(HttpStatus.Ok, res._items)
  }
}
