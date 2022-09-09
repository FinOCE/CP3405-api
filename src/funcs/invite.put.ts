import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"

export default class extends Func {
  public async run() {
    // Ensure user is logged in
    if (!this.user) return this.respond(HttpStatus.Unauthorized)

    // Get route parameters
    const parentId: string = this.context.bindingData.parentId

    // Create invite
    const res = await this.query(`
      g.V('${parentId}')
        .hasLabel('user')
        .as('parent')
      .V('${this.user.userId}')
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
