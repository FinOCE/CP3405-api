import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch all of a parent's children or just a specific one.
 *
 * Route: GET /users/{parentId}/children/{childId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent or child - No data
 * - NotFound: Specific child could not be found - No data
 * - Ok: Child(ren) successfully fetched - Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    // Get route parameters
    const parentId: string = this.context.bindingData.parentId
    const childId: string | undefined = this.context.bindingData.childId

    // Ensure user is logged in and is the parent or a child
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (![parentId, childId].includes(this.user.userId))
      return this.respond(HttpStatus.Forbidden)

    // Check that request is made by the parent or a child
    if (!childId && this.user.userId !== parentId)
      return this.respond(HttpStatus.Forbidden)

    if (childId) {
      const child = await this.query<Vertex<User, "user"> | undefined>(
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
    }

    // Fetch existing app connection(s)
    const children = await this.query<Vertex<User, "user">>(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasChild')
          ${!childId ? "" : `.where(inV().has('userId', '${childId}'))`}
        .inV()
      `
    ).then(res => res._items)

    // Return 404 if single not found
    if (childId && children.length === 0)
      return this.respond(HttpStatus.NotFound)

    // Respond to func call
    return this.respond(HttpStatus.Ok, children)
  }
}
