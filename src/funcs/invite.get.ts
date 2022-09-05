import Func, { HttpStatus } from "../models/Func"
import { UserProperties } from "../types/user"

export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    // Fetch invite
    const res = await this.query<
      EdgeAndVertex<InviteProperties, UserProperties, "hasInvite", "user">
    >(`
      g.V('${parentId}')
        .hasLabel('user')
      .outE('hasInvite')
        .as('edge')
      .inV()
        ${!childId ? "" : `.has('userId', '${childId}')`}
        .map(valueMap().unfold().group().by(keys).by(select(values).limit(local,1)))
      .project('vertex', 'edge')
        .by()
        .by('edge')`)

    // TODO: Figure out the format of the response and handle appropriately

    // Respond to request
    this.respond(HttpStatus.NotImplemented)
  }
}
