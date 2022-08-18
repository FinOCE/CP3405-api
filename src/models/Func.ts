import { Context, HttpRequest } from "@azure/functions"
import { Token } from "managers/TokenManager"
import { Roles } from "models/User"
import { UserProperties } from "types/user"
import * as Gremlin from "gremlin"
import { GremlinResponse } from "gremlin-cosmos"

export type CosmosStats = {
  "server-time": number
  "request-charge": number
}

export default abstract class Func {
  public user?: Token<UserProperties>
  public roles: Roles[] = []
  public cosmosStats: CosmosStats = {
    "server-time": 0,
    "request-charge": 0
  }

  private gremlinClient?: Gremlin.driver.Client

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
    this.gremlinClient?.close()
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

  /**
   * Query the database with a gremlin query
   */
  public async query<T = any>(query: string): Promise<GremlinResponse<T>> {
    if (!this.gremlinClient) {
      // Create gremlin client
      const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
        `/dbs/database/colls/graph`,
        process.env.GremlinDbPrimaryKey!
      )

      this.gremlinClient = new Gremlin.driver.Client(
        "wss://cp3405-db.gremlin.cosmos.azure.com:443/",
        {
          authenticator,
          traversalsource: "g",
          rejectUnauthorized: true,
          mimeType: "application/vnd.gremlin-v2.0+json"
        }
      )
    }

    // Submit query
    const res = (await this.gremlinClient!.submit(query)) as GremlinResponse<T>

    // Update cosmos stats for the function
    this.cosmosStats["server-time"] +=
      res.attributes["x-ms-total-server-time-ms"]
    this.cosmosStats["request-charge"] +=
      res.attributes["x-ms-total-request-charge"]

    // Return the result of the query
    return res
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
  Conflict = 409,
  InternalServerError = 500,
  NotImplemented = 501
}
