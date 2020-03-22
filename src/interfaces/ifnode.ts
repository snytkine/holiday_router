import { PARENT_NODE } from './constants';

export interface IExtractedPathParam {
  paramName: string;
  paramValue: string;
}

export interface IRegexParams {
  paramName: string;
  params: Array<string>;
}

export interface IUriParams {
  pathParams: Array<IExtractedPathParam>;
  regexParams?: Array<IRegexParams>;
}

export interface IRouteMatch<T extends IControllerContainer> {
  params: IUriParams;
  node: Node<T>;
}

export interface IStringMap {
  [key: string]: string;
}

export interface IControllerContainer {
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
  equals(other: IControllerContainer): boolean;

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
  priority: number;

  /**
   * Identifier for a controller. It does not have to be unique
   * it is used primarily for logging and debugging, a way to add a name to controller.
   */
  id: string;

  /**
   * Used for logging and debugging
   */
  toString(): string;
}

/**
 * can be undefined
 * the reason for undefined instead of null is so we can return
 * route match like this:
 * return this.controller && { controller: this.controller, params }
 * in which case if this.controller has not been initialized it will
 * be undefined and so the return value will also be undefined
 */
export type IRouteMatchResult<T extends IControllerContainer> = undefined | IRouteMatch<T>;

export interface Node<T extends IControllerContainer> {
  type: string;

  priority: number;

  name: string;

  controllers?: Array<T>;

  /**
   * Original uri template that was used in addController method call
   * This way a full uri template can be recreated by following parent nodes.
   */
  uriTemplate: string;

  paramName: string;

  equals(other: Node<T>): boolean;

  getRouteMatch(uri: string, params?: IUriParams): IRouteMatchResult<T>;

  /**
   * May throw error if addChild fails
   * such as in case of adding a node that equals to
   * one of existing child nodes.
   *
   * @param {Node<T>} node
   * @returns {boolean}
   *
   * @todo DO NOT RETURN Node, return void or throw
   * because it is confusing which node is returned - self or added node
   */
  addChildNode(node: Node<T>): Node<T>;

  addController(controller: T): Node<T>;

  getAllRoutes(): Array<IRouteMatch<T>>;

  getRouteMatchByControllerId(id: string): IRouteMatchResult<T>;

  /**
   * @TODO
   * return something like an Try<string>
   *   then can use flatMap pattern
   *
   * @param params
   */
  makeUri(params: IStringMap): string;

  children: Array<Node<T>>;

  /**
   * Having the property of type Symbol is an easy way
   * to exclude it from JSON.stringify
   * The parent node cannot be included in JSON because it
   * will create recursion error
   */
  [PARENT_NODE]?: Node<T>;
}
