import { IController, IRouteMatch, IUriParams, Node } from '../interfaces';

/**
 * Convenient way to create object of IRouteMatch
 * @todo no longer need to pass controllers param because
 * routeMatch can have just node and params. It will already have controllers in
 * the node because node without controllers will not be returned
 */
export default class RouteMatch<T extends IController> implements IRouteMatch<T> {
  public readonly node: Node<T>;

  public readonly params: IUriParams = { pathParams: [] };

  constructor(node: Node<T>, params: IUriParams = { pathParams: [] }) {
    this.node = node;
    this.params = params;
  }

  /**
   * This method is used for logging and debugging
   */
  public toString() {
    return `RouteMatch node=${this.node.name} controllers=${JSON.stringify(this.node.controllers)} params=${JSON.stringify(this.params)}`;
  }
}
