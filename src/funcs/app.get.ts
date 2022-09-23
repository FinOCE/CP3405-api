import Func, { HttpStatus } from "../models/Func"
import { UserProperties } from "../types/user"

/**
 * Get apps recommended to the parent. If an appId is provided,
 * it only fetches info about that one app. NotFound only occurs
 * if searching with an appId and it isn't found.
 *
 * Route: GET /users/{parentId}/apps/{appId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent's child - No data
 * - BadRequest: The request was not valid - API.Error
 * - NotFound: Specific app could not be found - No data
 * - Ok: App successfully recommended - TBD
 */
export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const appId: string | undefined = this.context.bindingData.appId

    // Check that request is made by the parent or a child
    if (!this.user) return this.respond(HttpStatus.Unauthorized)

    const child = await this.query<Vertex<UserProperties, "user"> | undefined>(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasChild')
          .where(
            inV()
              .has('userId', '${this.user.userId}')
          )
        .inV()
      `
    ).then(res => res._items[0])

    if (this.user.userId !== parentId && !child)
      return this.respond(HttpStatus.Forbidden)

    // Fetch existing app connection(s)
    const apps = await this.query(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasApp')
          ${!appId ? "" : `.where(inV().has('appId', '${appId}'))`}
          .as('edge')
        .inV()
          .as('app')
        .select('app', 'edge')
      `
    ).then(res => res._items)

    // Respond to func call
    return this.respond(HttpStatus.Ok, apps)
  }
}
