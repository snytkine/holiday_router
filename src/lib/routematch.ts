import { IController, IRouteMatch, IUriParams, Node } from '../interfaces';

/**
 * Convenient way to create object of IRouteMatch
 */
export default class RouteMatch<T extends IController> implements IRouteMatch<T> {
  public readonly node: Node<T>;

  public readonly controller: T;

  public readonly params: IUriParams = { pathParams: [] };

  constructor(node: Node<T>, controller: T, params: IUriParams = { pathParams: [] }) {
    this.node = node;
    this.controller = controller;
    this.params = params;
  }

  /**
   * This method is used for logging and debugging
   */
  public toString() {
    return `RouteMatch node=${this.node.name} controller=${
      this.controller.id
    } params=${JSON.stringify(this.params)}`;
  }
}
