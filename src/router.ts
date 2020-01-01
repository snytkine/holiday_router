import Debug from 'debug';
import {
  IController,
  IRouteMatchResult,
  IStringMap,
  IUriParams,
  Node,
  PARENT_NODE,
  ROUTE_PATH_SEPARATOR,
} from './interfaces';
import { RootNode } from './nodes';
import { makeUriTemplate, makeUrl, Strlib } from './utils';
import { makeNode } from './utils/adduri';
import { RouterError, RouterErrorCode } from './errors';
import { IRouteInfo } from './interfaces/routeinfo';
import { RouteInfo } from './lib';

const debug = Debug('GP-URI-ROUTER:router');
/**
 * @TODO add makeUri(controllerID, params) it will call getRouteMatchByControllerId and then makeUri(node,params) or throw
 */
export default class Router<T extends IController> {
  public rootNode: RootNode<T>;

  constructor() {
    this.rootNode = new RootNode();
  }

  public getRouteMatch(uri: string, params?: IUriParams): IRouteMatchResult<T> {
    return this.rootNode.getRouteMatch(uri, params);
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

    const childNode = makeNode<T>(head);
    childNode[PARENT_NODE] = parentNode;

    const addedNode = parentNode.addChildNode(childNode);

    if (!tail) {
      debug('Router.addRoute() no tail, adding controller to child node "%s"', childNode.name);
      return addedNode.addController(controller);
    }

    return this.addRoute(tail, controller, addedNode);
  }

  public makeUri(controllerId: string, params?: IStringMap): string {
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

  /**
   * @todo need to fix pathparamnoderegex constructor
   * and pass original uri template, otherwise we cannot recreate
   * full uri template from node since original template is lost in regex node
   */
  public getAllRoutes(): Array<IRouteInfo> {
    const routes = Array.from(this.rootNode.getAllRoutes());
    const res = routes.map(routeMatch => {
      return routeMatch.node.controllers.map(
        controller => new RouteInfo(makeUriTemplate(routeMatch.node), controller),
      );
    });

    /**
     * Flatten array
     */
    return res.reduce((prev, curr) => {
      return prev.concat(curr);
    });
  }
}
