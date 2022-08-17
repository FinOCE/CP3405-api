import * as jwt from "jsonwebtoken"

export default class TokenManager {
  /**
   * Generate a JWT with the given payload
   */
  public static generate(payload: jwt.JwtPayload): string {
    payload = Object.assign({}, payload)
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
  public static decode<T>(token: string): jwt.JwtPayload & T {
    return jwt.decode(token) as jwt.JwtPayload & T
  }
}
