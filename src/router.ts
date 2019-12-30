import Debug from 'debug';
import {
  IController,
  IRouteMatch,
  IRouteMatchResult,
  Node,
  PARENT_NODE,
  ROUTE_PATH_SEPARATOR,
} from './interfaces';
import { RootNode } from './nodes';
import { Strlib } from './utils';
import { makeNode } from './adduri';

const debug = Debug('GP-URI-ROUTER:router');
/**
 * @TODO rename getRouterMatchByControllerId to getRouteMatchByControllerId
 * @TODO add makeUri(controllerID, params) it will call getRouteMatchByControllerId and then makeUri(node,params) or throw
 * @TODO add getRouteMatchByControllerId to router and delegate call to rootNode
 * @TODO IRouteMatch interface has .controller prop but BasicController also has optional .controller
 * property this is confusing. What can we rename the controller prop in the IRouteMatch interface?
 * And also can we use just RouteMatch class without IRouteMatch interface?
 * @TODO add HttpRouter class that will hold map requestMethod => Router
 * it will have methods similar to methods in router but will also take RequestMethod as first param
 * and then will delegate to that router's corresponding method
 * That will just be a convenience class. A router can achieve multiple request methods
 * by adding multiple ControllerDetails classes with predicates that check for request method.
 * The problem with relying on multiple ControllerDetails is that findRoute convenience method
 * returns only first ControllerDetails instance, so in this implementation cannot use findRoute at all
 * and must use findRoutes, get iterator and then get first matching ControllerDetails by passing Node's req
 * object to some type of predicate function.
 */
export default class Router<T extends IController> {
  public rootNode: RootNode<T>;

  constructor() {
    this.rootNode = new RootNode();
  }

  public *findRoutes(uri: string): IterableIterator<IRouteMatch<T>> {
    debug('Entered Router.findRoutes() with uri="%s"', uri);
    yield* this.rootNode.findRoutes(uri);
  }

  public findRoute(uri: string): IRouteMatchResult<T> {
    debug('Entered Router.findRoute() with uri="%s"', uri);
    return this.rootNode.findRoutes(uri).next().value;
  }

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
}
