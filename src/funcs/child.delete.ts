import Func, { HttpStatus } from "../models/Func"

export default class extends Func {
  public async run() {
    return this.respond(HttpStatus.NotImplemented)
  }
}
