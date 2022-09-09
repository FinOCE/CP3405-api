import * as jwt from "jsonwebtoken"

export type Token<T extends Record<string, any>> = jwt.JwtPayload & T

export default class TokenManager {
  /**
   * Generate a JWT with the given payload
   */
  public static generate(payload: jwt.JwtPayload, days: number = 7): string {
    payload = Object.assign(
      {
        exp: Math.floor(new Date().getTime() + 1000 * 60 * 60 * 24 * days)
      },
      payload
    )
    return jwt.sign(payload, process.env.JwtSecretKey!)
  }

  /**
   * Check if a token is valid
   */
  public static validate(token: string | undefined): boolean {
    if (!token) return false

    try {
      jwt.verify(token, process.env.JwtSecretKey!)
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Decode a token to get the payload
   */
  public static decode<T extends Record<string, any>>(token: string): Token<T> {
    return jwt.decode(token) as Token<T>
  }
}
