import { Context, HttpRequest } from "@azure/functions"

export default abstract class Func {
  public constructor(public context: Context, public req: HttpRequest) {}

  /**
   * Run the function
   */
  public abstract run(): Promise<void>
}
