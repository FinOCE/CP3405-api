import crypto from "crypto"
import Schema from "password-validator"

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

  /**
   * Check that a password meets security requirements
   */
  public static validate(password: string): boolean {
    const schema = new Schema()
      .is()
      .min(8)
      .is()
      .max(64)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .not()
      .spaces()

    return schema.validate(password) as boolean
  }
}
