declare namespace Noti {
  /**
   * All different types of notifications
   */
  type Type =
    | "appAdd"
    | "appRemove"
    | "childRemove"
    | "inviteAccept"
    | "inviteAdd"
    | "inviteDecline"
    | "parentRemove"

  /**
   * Base type for notifications
   */
  type Base = {
    type: Type
    timestamp: number
    viewed: boolean
  }

  /**
   * Notification where you don't know what type it is yet
   */
  type Unknown = Base & Record<string, any>

  /**
   * Notification for a parent where someone wants to be saved as their child
   */
  type InviteAdd = Base & {
    type: "inviteAdd"
    child: Vertex<User, "user">
  }

  /**
   * Notification for someone being accepted as someone's child
   */
  type InviteAccept = Base & {
    type: "inviteAccept"
    parent: Vertex<User, "user">
  }

  /**
   * Notification for someone being decliend as someone's child
   */
  type InviteDecline = Base & {
    type: "inviteDecline"
    parent: Vertex<User, "user">
  }

  /**
   * Notification for a parent who has had a new app recommended to them
   */
  type AppAdd = Base & {
    type: "appAdd"
    app: Vertex<App, "app">
    message?: string
  }

  /**
   * Notification for a parent who has an app removed from their list
   */
  type AppRemove = Base & {
    type: "appRemove"
    app: Vertex<App, "app">
  }

  /**
   * Notification for a child who has been removed from a parent
   */
  type ChildRemove = Base & {
    type: "childRemove"
    parent: Vertex<User, "user">
  }

  /**
   * Notification for a parent who has been removed from a child
   */
  type ParentRemove = Base & {
    type: "parentRemove"
    child: Vertex<User, "user">
  }
}
