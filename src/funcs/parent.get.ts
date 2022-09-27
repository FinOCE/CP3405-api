import Func, { HttpStatus } from "../models/Func"

/**
 * Fetch all of a child's parents or just a specific one.
 *
 * Route: GET /users/{childId}/parents/{parentId?}
 * Body: None
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent or child - No data
 * - NotFound: Specific parent could not be found - No data
 * - Ok: Parent(s) successfully fetched - Vertex<User, 'user'>[]
 */
export default class extends Func {
  public async run() {
    // Get route parameters
    const childId: string = this.context.bindingData.childId
    const parentId: string | undefined = this.context.bindingData.parentId

    // Ensure user is logged in and is the parent or a child
    if (!this.user) return this.respond(HttpStatus.Unauthorized)
    if (![parentId, childId].includes(this.user.userId))
      return this.respond(HttpStatus.Forbidden)

    // Check that request is made by the parent or a child
    if (!parentId && this.user.userId !== childId)
      return this.respond(HttpStatus.Forbidden)

    if (parentId) {
      const parent = await this.query<Vertex<User, "user"> | undefined>(
        `
          g.V('${childId}')
            .hasLabel('user')
          .inE('hasChild')
            .where(
              outV()
                .has('userId', '${this.user.userId}')
            )
          .outV()
        `
      ).then(res => res._items[0])

      if (this.user.userId !== childId && !parent)
        return this.respond(HttpStatus.Forbidden)
    }

    // Fetch existing app connection(s)
    const parents = await this.query<Vertex<User, "user">>(
      `
        g.V('${childId}')
          .hasLabel('user')
        .inE('hasChild')
          ${!parentId ? "" : `.where(outV().has('userId', '${parentId}'))`}
        .outV()
      `
    ).then(res => res._items)

    // Return 404 if single not found
    if (parentId && parents.length === 0)
      return this.respond(HttpStatus.NotFound)

    // Respond to func call
    return this.respond(HttpStatus.Ok, parents)
  }
}
