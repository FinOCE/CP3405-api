import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"

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
    const res = await this.query(`
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
    `)

    // Handle if the parent ID does not exist
    if (!res._items[0])
      return this.respond(HttpStatus.BadRequest, {
        message: "Invalid parent ID provided"
      })

    // Respond to request
    return this.respond(HttpStatus.NoContent)
  }
}
