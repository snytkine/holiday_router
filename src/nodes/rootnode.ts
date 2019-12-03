import {
  IController,
  Node,
  ROUTE_PATH_SEPARATOR,
  RouteMatch,
  RouteMatchResult,
  UriParams
} from '../interfaces'
import {
  makeNode,
  splitBySeparator
} from '../lib'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'

import Debug from 'debug';
const debug = Debug('GP-URI-ROUTER');

import { SYM_CONTROLLER_URI } from '../constants'


export class RootNode<T extends IController> implements Node<T> {

  public controllers: Array<T>;

  get type() {
    return 'RootNode';
  }

  get priority(): number {
    return getNodePriority(PRIORITY.ROOT)
  }

  get name(): string {
    return 'RootNode';
  }

  public children: Array<Node<T>>;

  constructor() {
    this.children = [];
    this.controllers = [];
  }

  /**
   * @todo use this.controllers instead of passing first arg
   * @todo rename to makeControllerIterator
   * @param controllers
   * @param params
   */
  protected* getRouteMatchIterator(params: UriParams): IterableIterator<RouteMatch<T>> {
    for (const controller of this.controllers) {
      yield {
        controller,
        params
      }
    }
  }

  /**
   * Every node type will be equal to RootNode
   * @param {Node<T>} other
   * @returns {boolean}
   */
  equals(other: Node<T>): boolean {
    return (other.type === this.type);
  }

  protected* findChildMatches(uri: string, params: UriParams): IterableIterator<RouteMatch<T>> {

    for (const childNode of this.children) {
      yield* childNode.findRoutes(uri, params);
    }
  }

  /**
   * RootNode cannot be matched to any URI
   * it can only find match in child nodes.
   *
   * @param {string} uri
   * @param {UriParams} params
   * @returns {RouteMatchResult<T>}
   */
  public findRoute(uri: string, params?: UriParams): RouteMatch<T> | undefined {
    return this.findRoutes(uri, params)
    .next().value;
  }

  public* findRoutes(uri: string, params ?: UriParams): IterableIterator<RouteMatch<T>> {
    yield* this.findChildMatches(uri, params);
  }


  public* getAllControllers(): IterableIterator<T> {

    yield* this.controllers

    for (const childNode of this.children) {
      yield* childNode.getAllControllers();
    }
  }

  public addRoute(uri: string, controller: T): Node<T> {

    debug('Entered addRoute on node="%s" with uri="%s" controller="%s', this.name, uri, controller.id);

    if (!controller[SYM_CONTROLLER_URI]) {
      controller[SYM_CONTROLLER_URI] = uri;
      debug('Added SYM_CONTROLLER_URI "%s" to controller "%s"', controller[SYM_CONTROLLER_URI], controller.id)
    }

    if (!uri) {
      return this.addController(controller, controller[SYM_CONTROLLER_URI]);
    }

    const { head, tail } = splitBySeparator(uri, [ROUTE_PATH_SEPARATOR]);

    const childNode = makeNode<T>(head);

    return this.addChildNode(childNode).addRoute(tail, controller)

  }


  public addChildNode(node: Node<T>): Node<T> {

    debug('Entered addChildNode on node "%s" with node "%s"', this.name, node.name)
    const existingChildNode: Node<T> = this.children.find(_ => _.equals(node));
    if (existingChildNode) {
      debug('Node "%s" has childNode "%s" equals to new node "%s"', this.name, existingChildNode.name, node.name)
      return existingChildNode;
    }

    this.children = [...this.children, node].sort((node1, node2) => node2.priority - node1.priority);

    return node;
  }


  public addController(controller: T, uriPattern: string): Node<T> {

    debug('Entered addController for node="%s" with controller="%s" uriPattern="%s"', this.name, controller.id, uriPattern);
    /**
     * Must check if existing node equals to this node AND if this node
     * is equals to existing node because it's possible that existing node
     * is not equals to this controller but this controller is a type of controller that
     * returns true from its equals() method (for example UniqueController)
     */
    const existingCtrl = this.controllers.find(
      ctrl => ctrl.equals(controller) || controller.equals(ctrl));

    if (existingCtrl) {
      const error = `Duplicate_Controller_Error for route "${controller[SYM_CONTROLLER_URI]}" Cannot add controller ${controller.id} to node ${this.name} because equal controller ${existingCtrl.id} already exists`;
      debug(error)
      throw new Error(error);
    }

    controller.setUriPattern(uriPattern);

    this.controllers = [...this.controllers, controller].sort((ctrl1, ctrl2) => ctrl2.priority - ctrl1.priority);

    return this;
  }

}
