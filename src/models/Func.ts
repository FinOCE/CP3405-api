import { Context, HttpRequest } from "@azure/functions"
import { Roles } from "models/User"

export type CosmosStats = {
  "server-time": number
  "request-charge": number
}

export default abstract class Func {
  public roles: Roles[] = []
  public cosmosStats: CosmosStats = {
    "server-time": 0,
    "request-charge": 0
  }

  public constructor(public context: Context, public req: HttpRequest) {}

  /**
   * Run the function
   */
  public abstract run(): Promise<void>

  /**
   * Respond to this function call by appending data to context
   */
  public respond(status: HttpStatus, data?: any) {
    Func.respond(this.context, status, this.cosmosStats, data)
  }

  /**
   * Respond to any function call by appending data to context
   */
  public static respond(
    context: Context,
    status: HttpStatus,
    cosmosStats?: CosmosStats,
    data?: any
  ) {
    context.res = {
      body: {
        data,
        cosmos: cosmosStats ?? { "server-time": 0, "request-charge": 0 }
      },
      status
    }
  }
}

export enum HttpStatus {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  NotImplemented = 501
}
