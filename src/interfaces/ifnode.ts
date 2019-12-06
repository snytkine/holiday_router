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

export interface RouteMatch<T extends IController> {
  controller: T
  params: UriParams
  node: Node<T>
}

export interface IStringMap {
  [key: string]: string
}

/**
 * can be undefined
 * the reason for undefined instead of null is so we can return
 * route match like this:
 * return this.controller && { controller: this.controller, params }
 * in which case if this.controller has not been initialized it will
 * be undefined and so the return value will also be undefined
 */
export type RouteMatchResult<T extends IController> = RouteMatch<T> | undefined | false

export interface IController {

  /**
   * Controller must implement its own logic
   * of how it determines if another controller is functionally equal
   * to this controller.
   *
   * The purpose of calling equals(other) method is to prevent
   * having 2 controller that can respond to same uri.
   *
   * @param other
   */
  equals(other: IController): boolean

  /**
   * The router node will call this method with
   * the full uri pattern that was used in addRoute(uri, controller) method
   * A controller may use this value for any reason, it does not have to use it at all
   * The uri pattern may be used for reverse route generation
   * For example: a controller may have a method like generateUri(params)
   * then it will use params object to create uri from uri pattern
   *
   * @param uri
   */
  setUriPattern(uri: string)

  /**
   * Multiple controller may exist in the same node, meaning
   * that more than one controller can match same uri
   * it's up to consuming program to iterate over results and
   * find the best match.
   * a controller with higher priority will be returned first from
   * controller iterator.
   * In general if multiple controllers can be used for same URI, a controller
   * will also have some sort of filter function that will accept one or more params
   * from consuming application to determine if controller is a match
   * a controller with a more specific filter should have higher priority
   *
   * For example one controller may require that request have a specific header
   * and another controller will serve every other request. The controller that requires
   * a specific header should be tested first, otherwise the second more general controller
   * will always match. For this reason the first controller must have higher priority
   */
  priority: number

  /**
   * Identifier for a controller. It does not have to be unique
   * it is used primarily for logging and debugging, a way to add a name to controller.
   */
  id: string
}


export interface Node<T extends IController> {

  type: string

  priority: number

  name: string

  controllers: Array<T>

  paramName: string;

  equals(other: Node<T>): boolean

  findRoute?(uri: string, params?: UriParams): RouteMatchResult<T>

  findRoutes(uri: string, params?: UriParams): IterableIterator<RouteMatch<T>>

  /**
   * May throw error if addChild fails
   * such as in case of adding a node that equals to
   * one of existing child nodes.
   *
   * @param {Node<T>} node
   * @returns {boolean}
   */
  addChildNode(node: Node<T>): Node<T>

  addController(controller: T, uriPattern: string): Node<T>

  addRoute(uri: string, controller: T): Node<T>

  getAllControllers(): IterableIterator<T>

  makeUri(params: IStringMap): string | Error

  children: Array<Node<T>>;

  parentNode?: Node<T>
}



