import { Context, HttpRequest } from "@azure/functions"
import Func, { HttpStatus } from "../models/Func"
import TokenManager from "../managers/TokenManager"
import { UserProperties } from "../types/user"
import { Roles } from "../models/User"

export default class FuncManager {
  public readonly func?: Func

  public constructor(public context: Context, public req: HttpRequest) {
    // Find and bind function to the manager
    const funcName = this.context.executionContext.functionName.substring(2)
    const funcMethod = req.method!.toLowerCase()
    const func = require(`../funcs/${funcName}.${funcMethod}`)?.default
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

    if (TokenManager.validate(token)) {
      manager.func.user = TokenManager.decode<UserProperties>(token!)
    }

    if (manager.func.roles.length > 0) {
      if (!manager.func.user)
        return Func.respond(manager.context, HttpStatus.Unauthorized)
      else if (
        !manager.func.roles.map(r => Roles[r]).includes(manager.func.user.role)
      )
        return Func.respond(manager.context, HttpStatus.Forbidden)
    }

    // Run the validated function
    await manager.func.run()
  }
}
