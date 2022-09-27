export default class Notification {
  /**
   * Generate a useful notification from the database edge and vertex
   */
  public static generate(
    data: EdgeAndVertex<Noti.Base, any, "hasNotification", string>
  ): Noti.Unknown {
    const base = {
      type: data.edge.properties.type,
      timestamp: data.edge.properties.timestamp,
      viewed: data.edge.properties.viewed
    }

    delete data.vertex.properties.password
    delete data.vertex.properties.email

    if (data.edge.properties.type === "appAdd") {
      const isAppEdge = (props: Noti.Base): props is Noti.Base & AppEdge => {
        return "message" in props
      }

      const message = isAppEdge(data.edge.properties)
        ? data.edge.properties.message
        : undefined

      return Object.assign(base, {
        app: data.vertex,
        message
      })
    } else if (data.edge.properties.type === "appRemove") {
      return Object.assign(base, {
        app: data.vertex
      })
    } else if (data.edge.properties.type === "childRemove") {
      return Object.assign(base, {
        parent: data.vertex
      })
    } else if (data.edge.properties.type === "inviteAccept") {
      return Object.assign(base, {
        parent: data.vertex
      })
    } else if (data.edge.properties.type === "inviteAdd") {
      return Object.assign(base, {
        child: data.vertex
      })
    } else if (data.edge.properties.type === "inviteDecline") {
      return Object.assign(base, {
        parent: data.vertex
      })
    } else if (data.edge.properties.type === "parentRemove") {
      return Object.assign(base, {
        child: data.vertex
      })
    } else throw new Error("Unknown notification attempted to be fetched")
  }
}
