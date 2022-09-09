import Func, { HttpStatus } from "../models/Func"
import { UserProperties } from "../types/user"

export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    // Fetch invite
    const res = await this.query<Vertex<UserProperties, "user">>(`
      g.V('${parentId}')
        .hasLabel('user')
      .outE('hasInvite')
      .inV()
        ${!childId ? "" : `.has('userId', '${childId}')`}
    `)

    // Respond to request
    return this.respond(
      HttpStatus.Ok,
      res._items.map(child => ({ type: "childRequest", child }))
    )
  }
}
