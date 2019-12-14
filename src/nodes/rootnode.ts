import {
  IController,
  IStringMap,
  Node,
  ROUTE_PATH_SEPARATOR,
  IRouteMatch,
  IRouteMatchResult,
  UriParams,
  PARENT_NODE
} from '../interfaces';
import {
  makeNode,
  ensureNoDuplicatePathParams,
  RouteMatch,
  splitBySeparator
} from '../lib'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities';
import { SYM_CONTROLLER_URI } from '../constants';
import Debug from 'debug';
import { TAG } from '../enums'

const debug = Debug('GP-URI-ROUTER:NODE:RootNode');

/**
 * @todo add getter and setter to parent node
 * throw exception is parent was already set - allow setting only once
 * and may try to use WeakMap<Node<T>> where 'this' will be a key and
 * parent node a value
 * this way a reference to parent node will not be counted for garbage collection.
 * This should not be necessary as V8 GC should easily figure our this case of
 * circular reference issue, but maybe it will help GC or may it any more efficient?
 */
export class RootNode<T extends IController> implements Node<T> {

  public [PARENT_NODE]: Node<T>;

  public controllers: Array<T>;

  public paramName = '';

  get type() {
    return TAG.ROOT_NODE;
  }

  get priority(): number {
    return getNodePriority(PRIORITY.ROOT)
  }

  get name(): string {
    return TAG.ROOT_NODE;
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
  protected* getRouteMatchIterator(params: UriParams): IterableIterator<IRouteMatch<T>> {
    debug('Entered getRouteMatchIterator with params=%O controllers=%O', params, this.controllers);

    for (const controller of this.controllers) {
      yield new RouteMatch(this, controller, params);
    }
  }

  /**
   * @param {Node<T>} other
   * @returns {boolean}
   */
  equals(other: Node<T>): boolean {
    return (other.type === this.type);
  }

  protected* findChildMatches(uri: string, params: UriParams): IterableIterator<IRouteMatch<T>> {

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
   * @returns {IRouteMatchResult<T>}
   */
  public findRoute(uri: string, params?: UriParams): IRouteMatchResult<T> {
    return this.findRoutes(uri, params)
    .next().value;
  }

  public* findRoutes(uri: string, params ?: UriParams): IterableIterator<IRouteMatch<T>> {
    yield* this.findChildMatches(uri, params);
  }


  public* getAllControllers(): IterableIterator<IRouteMatch<T>> {

    for (const ctrl of this.controllers) {
      yield new RouteMatch(this, ctrl, { pathParams: [] });
    }

    for (const childNode of this.children) {
      yield* childNode.getAllControllers();
    }
  }

  public getRouterMatchByControllerId(id: string): IRouteMatchResult<T> {

    debug('Entered getRouterMatchByControllerId in node "%s" with id="id"', this, id)

    const it = this.getAllControllers();
    for (const routeMatch of it) {
      debug('controller="%s"', routeMatch.controller.id);
      if (routeMatch.controller.id === id) {
        return routeMatch;
      }
    }
  }

  public addRoute(uri: string, controller: T): Node<T> {

    debug('Entered addRoute on node="%s" with uri="%s" controller="%s', this.name, uri, controller.id);

    if (!uri) {
      return this.addController(controller);
    }

    const { head, tail } = splitBySeparator(uri, [ROUTE_PATH_SEPARATOR]);

    const childNode = makeNode<T>(head);

    return this.addChildNode(childNode)
    .addRoute(tail, controller);
  }


  public addChildNode(node: Node<T>): Node<T> {

    debug('Entered addChildNode on node "%s" with node "%s"', this.name, node.name)
    const existingChildNode: Node<T> = this.children.find(_ => _.equals(node));
    if (existingChildNode) {
      debug('Node "%s" has childNode "%s" equals to new node "%s"', this.name, existingChildNode.name, node.name)
      return existingChildNode;
    }

    node[PARENT_NODE] = this;

    /**
     * Validate to make sure new node does not have any
     * pathParam with the same name as any of the parent nodes
     */
    ensureNoDuplicatePathParams(this, node.paramName);

    this.children = [...this.children, node].sort((node1, node2) => node2.priority - node1.priority);

    return node;
  }


  public addController(controller: T): Node<T> {

    debug('Entered addController for node="%s" with controller="%s"', this.name, controller.id);
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
      throw new Error(error);
    }

    this.controllers = [...this.controllers, controller].sort((ctrl1, ctrl2) => ctrl2.priority - ctrl1.priority);

    return this;
  }


  makeUri(params: IStringMap): string {
    return '';
  }

}
