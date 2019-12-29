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
