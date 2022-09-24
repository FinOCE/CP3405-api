import Func, { HttpStatus } from "../models/Func"
// import fetch from "node-fetch"
// import { load } from "cheerio"
import { UserProperties } from "../types/user"
import Notification from "../models/Notification"

/**
 * Add an app to a parent. Called when an app is sent
 *
 * Route: PUT /users/{parentId}/apps/{appId}
 * Body: {
 *  message: string | undefined
 *  name: string
 *  creator: string
 *  iconUrl: string
 * }
 *
 * Possible responses:
 * - Unauthorized: User is not logged in - No data
 * - Forbidden: User is not marked as the parent's child - No data
 * - BadRequest: The request was not valid - API.Error
 * - Ok: App successfully recommended - Noti.AppAdd[]
 */
export default class extends Func {
  public async run() {
    // Validate route
    const parentId: string = this.context.bindingData.parentId
    const appId: string | undefined = this.context.bindingData.appId

    if (!appId)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing app ID in route"
      })

    const message: string | undefined = this.req.body?.message

    // Get data from body (TEMPORARY - Cheerio is breaking the pipeline... TODO: Fix)
    const name: string | undefined = this.req.body.name
    const creator: string | undefined = this.req.body.creator
    const iconUrl: string | undefined = this.req.body.iconUrl

    if (!name || !creator || !iconUrl)
      return this.respond(HttpStatus.BadRequest, {
        message: "Missing some temporary body props"
      })

    // Check that the user is a child of the parent
    if (!this.user) return this.respond(HttpStatus.Unauthorized)

    const child = await this.query<Vertex<UserProperties, "user"> | undefined>(
      `
        g.V('${parentId}')
          .hasLabel('user')
        .outE('hasChild')
          .where(
            inV()
              .has('userId', '${this.user.userId}')
          )
        .inV()
      `
    ).then(res => res._items[0])

    if (!child) return this.respond(HttpStatus.Forbidden)

    // Check if app already exists in database
    let app = await this.query<Vertex<App, "app"> | undefined>(
      `
        g.V('${appId}')
          .hasLabel('app')
      `
    ).then(res => res._items[0])

    // Add app to database if it doesn't exist
    if (!app) {
      // Scrape the play store for details
      // To use this code: npm i cheerio@latest
      // const html = await fetch(
      //   `https://play.google.com/store/apps/details?id=${appId}`,
      //   { method: "GET" }
      // ).then(res => res.text())

      // const $ = load(html)
      // const name = $(".Fd93Bb").find("span").text()
      // const creator = $(".Vbfug").find("span").text()
      // const iconUrl = $(".Mqg6jb").find("img").attr("src")

      // Create app in database
      app = await this.query<Vertex<App, "app">>(
        `
          g.addV('app')
            .property('id', '${appId}')
            .property('userId', 'NO_AFFILIATED_USER')
            .property('appId', '${appId}')
            .property('name', '${name}')
            .property('creator', '${creator}')
            .property('iconUrl', '${iconUrl}')
        `
      ).then(res => res._items[0])
    }

    // Delete existing link if exists
    await this.query(`
      g.V('${parentId}')
      .outE('hasApp')
        .where(
          inV()
            .has('appId', '${appId}')
        )
        .drop()
    `)

    // Link parent to app
    await this.query(`
      g.V('${parentId}')
        .as('parent')
      .V('${app!.id}')
        .as('app')
      .addE('hasApp')
        ${!message ? "" : `.property('message', '${message}')`}
        .property('timestamp', ${Date.now()})
        .from('parent')
        .to('app')
    `)

    // Send notification for new app to parent
    const notification = await this.query<
      EdgeAndVertex<Noti.Base, any, "hasNotification", string>
    >(
      `
        g.V('${appId}')
          .as('app')
        .V('${parentId}')
          .as('vertex')
        .addE('hasNotification')
          .property('type', 'appAdd')
          .property('timestamp', ${Date.now()})
          .property('viewed', false)
          .from('vertex')
          .to('app')
          .as('edge')
        .select('edge', 'vertex')
      `
    ).then(res => res._items.map(noti => Notification.generate(noti)))

    // Respond to request
    return this.respond(HttpStatus.Ok, notification)
  }
}
