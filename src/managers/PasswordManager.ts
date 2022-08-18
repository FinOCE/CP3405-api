import * as crypto from "crypto"

export default class PasswordManager {
  /**
   * Hash a password with the password hash secret key
   */
  public static hash(password: string): string {
    return crypto
      .createHmac("sha3-256", process.env.PasswordHashSecretKey!)
      .update(password)
      .digest("hex")
  }
}
