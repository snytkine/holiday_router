import Debug from 'debug';
import {
  IControllerContainer,
  IRouteInfo,
  IRouteMatchResult,
  IStringMap,
  Node,
  PARENT_NODE,
  ROUTE_PATH_SEPARATOR,
} from './interfaces';
import { RootNode } from './nodes';
import { makeUriTemplate, makeUrl, Strlib } from './utils';
import { makeNode } from './utils/adduri';
import { RouterError, RouterErrorCode } from './errors';
import { RouteInfo } from './lib';

const debug = Debug('HOLIDAY-ROUTER:router');
/**
 * @TODO add makeUri(controllerID, params) it will call getRouteMatchByControllerId and then makeUri(node,params) or throw
 */
export default class Router<T extends IControllerContainer> {
  public rootNode: RootNode<T>;

  constructor() {
    this.rootNode = new RootNode();
  }

  public getRouteMatch(uri: string): IRouteMatchResult<T> {
    return this.rootNode.getRouteMatch(uri);
  }

  /**
   * @todo make a private or protected method appendRoute and delegate to
   * that method passing parentNode.
   * Remove parentNode param from this method
   * This way the public method will not take this param because end-user not supposed
   * to manually pass this last param.
   *
   * @param uri
   * @param controller
   * @param parentNode
   */
  public addRoute(uri: string, controller: T, parentNode: Node<T> = this.rootNode): Node<T> {
    debug(
      'Entered Router.addRoute() with uri="%s" controller:"%s" parentNode="%s"',
      uri,
      controller.toString(),
      parentNode.name,
    );

    /**
     * Special case if uri is empty then add controller to rootNode
     */
    if (uri.trim() === '') {
      debug(
        'Router.addRoute empty uri passed. Adding controller "%s" to rootNode',
        controller.toString(),
      );

      return parentNode.addController(controller);
    }

    const { head, tail } = Strlib.splitUriByPathSeparator(uri, [ROUTE_PATH_SEPARATOR]);

    const childNode = <Node<T>>makeNode<T>(head);
    childNode[PARENT_NODE] = parentNode;

    const addedNode = parentNode.addChildNode(childNode);

    if (!tail) {
      debug('Router.addRoute() no tail, adding controller to child node "%s"', childNode.name);
      return addedNode.addController(controller);
    }

    return this.addRoute(tail, controller, addedNode);
  }

  public makeUri(controllerId: string, params: IStringMap = {}): string {
    debug('Entered router.makeUri with controllerId="%s", params="%o"', controllerId, params);
    const routeMatch = this.rootNode.getRouteMatchByControllerId(controllerId);

    if (!routeMatch) {
      throw new RouterError(
        `Controller with id="${controllerId}" not found`,
        RouterErrorCode.CONTROLLER_NOT_FOUND,
      );
    }

    return makeUrl(routeMatch.node, params);
  }

  public getAllRoutes(): Array<IRouteInfo> {
    const routes = this.rootNode.getAllRoutes();
    return routes
      .map(routeMatch => {
        // @ts-ignore
        return routeMatch.node.controllers.map(
          controller => new RouteInfo(makeUriTemplate(routeMatch.node), controller),
        );
      })
      .reduce((prev, curr) => {
        return prev.concat(curr);
      });
  }
}
