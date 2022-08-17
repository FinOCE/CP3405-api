import { Context, HttpRequest } from "@azure/functions"
import Func from "models/Func"

export default class FuncManager {
  public readonly func: Func

  /**
   * Trigger a function
   */
  public static async trigger(context: Context, req: HttpRequest) {
    const manager = new FuncManager(context, req)
    manager.func.run()
  }

  public constructor(public context: Context, public req: HttpRequest) {
    const funcName = this.context.executionContext.functionName.substring(2)
    this.func = new (require(`../funcs/${funcName}.${req.method!}`).default)(
      this.context,
      this.req
    )
  }
}
