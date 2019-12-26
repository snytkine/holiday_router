import { IController, IRouteMatch, IUriParams, Node } from '../interfaces';

/**
 * Convenient way to create object of IRouteMatch
 */
export class RouteMatch<T extends IController> implements IRouteMatch<T> {
  constructor(
    public node: Node<T>,
    public controller: T,
    public params: IUriParams = { pathParams: [] },
  ) {}

  /**
   * This method is used for logging and debugging
   */
  public toString() {
    return `RouteMatch node=${this.node.name} controller=${
      this.controller.id
    } params=${JSON.stringify(this.params)}`;
  }
}
