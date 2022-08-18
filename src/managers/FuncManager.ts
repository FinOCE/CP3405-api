import { Context, HttpRequest } from "@azure/functions"
import Func, { HttpStatus } from "../models/Func"
import TokenManager, { Token } from "../managers/TokenManager"
import { UserProperties } from "../types/user"

export default class FuncManager {
  public readonly func?: Func

  public constructor(public context: Context, public req: HttpRequest) {
    const funcName = this.context.executionContext.functionName.substring(2)
    const func = require(`../funcs/${funcName}.${req.method!}`)?.default
    if (func) this.func = new func(this.context, this.req)
  }

  /**
   * Trigger a function
   */
  public static async trigger(context: Context, req: HttpRequest) {
    const manager = new FuncManager(context, req)

    // Check that function exists
    if (!manager.func)
      return Func.respond(manager.context, HttpStatus.NotImplemented)

    // Validate user token and check permissions with func
    const token = req.headers["authorization"]?.split("Bearer ")?.[1]
    if (!TokenManager.validate(token) && manager.func.roles.length > 0)
      return Func.respond(manager.context, HttpStatus.Unauthorized)

    let user: Token<UserProperties> | undefined
    if (token) {
      user = TokenManager.decode<UserProperties>(token!)
      if (!manager.func.roles.map(r => HttpStatus[r]).includes(user.role))
        return Func.respond(manager.context, HttpStatus.Forbidden)

      manager.func.user = user
    }

    // Run the validated function
    manager.func.run()
  }
}
