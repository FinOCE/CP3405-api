import { Context, HttpRequest } from "@azure/functions"
import FuncManager from "managers/FuncManager"

export default async function (context: Context, req: HttpRequest) {
  await FuncManager.trigger(context, req)
}
