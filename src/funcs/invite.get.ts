import Func, { HttpStatus } from "../models/Func"
import { InviteStatus } from "../models/Invite"
import { UserProperties } from "../types/user"

export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

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
