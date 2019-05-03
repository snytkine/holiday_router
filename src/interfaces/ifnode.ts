

export interface ExtractedPathParam {
  paramName: string
  paramValue: string
}

export interface RegexParams {
  paramName: string,
  params: Array<string>
}

export interface UriParams {
  pathParams: Array<ExtractedPathParam>
  regexParams?: Array<RegexParams>
}

export interface RouteMatch<T> {
  controller: T
  params: UriParams
}

/**
 * can be undefined
 * the reason for undefined instead of null is so we can return
 * route match like this:
 * return this.controller && { controller: this.controller, params }
 * in which case if this.controller has not been initialized it will
 * be undefined and so the return value will also be undefined
 */
export type RouteMatchResult<T> = RouteMatch<T> | undefined | false

export interface Node<T> {

  priority: number

  name: string

  controller?: T

  equals(other: Node<T>): boolean

  findRoute(uri: string, params?: UriParams): RouteMatchResult<T>

  /**
   * May throw error if addChild fails
   * such as in case of adding a node that equals to
   * one of existing child nodes.
   *
   * @param {Node<T>} node
   * @returns {boolean}
   */
  addChild(node: Node<T>): void;

  /**
   *
   * @param {string} uri
   * @param {T} controller
   * @returns {Node<T> | Error}
   */
  addUriController(uri: string, controller: T): Node<T>;

  children: Array<Node<T>>;
}



