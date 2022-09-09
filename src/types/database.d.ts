type Generic = boolean | number | string

/**
 * The format of an edge from the database
 */
type Edge<T = Record<string, Generic>, L = string> = {
  type: "edge"
  id: string
  label: L
  inVLabel: string
  outVLabel: string
  inV: string
  outV: string
  properties: T
}

/**
 * The format of properties within a vertex from the database
 */
type VertexProperties<T> = {
  [K in keyof T]: {
    id: string
    value: T[K]
  }[]
}

/**
 * The format of a vertex from the database
 */
type Vertex<T = Record<string, Generic>, L = string> = {
  type: "vertex"
  id: string
  label: L
  properties: VertexProperties<T>
}

/**
 * Type for a response containing an edge and vertex projected
 */
type EdgeAndVertex<T1, T2, L1 = string, L2 = string> = {
  edge: Edge<T1, L1>
  vertex: Vertex<T2, L2>
}
