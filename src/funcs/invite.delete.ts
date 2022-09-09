import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"

export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    // Ensure user is logged in and is the child or parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (![parentId, childId].includes(this.user.userId))
      return this.respond(HttpStatus.Forbidden)

    if (!childId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing child ID in route"
      })

    // Submit query
    this.query(`
      g.V('${parentId}')
        .hasLabel('user')
      .outE('hasInvite')
        .where(
          inV()
            .has('userId', '${childId}')
        )
        .property('status', '${InviteStatus[InviteStatus.Rejected]}')
    `)

    // Respond to request
    return this.respond(HttpStatus.NoContent)
  }
}
