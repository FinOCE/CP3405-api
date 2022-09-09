import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"

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
    const res = await this.query(`
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
