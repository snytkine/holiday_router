import Debug from 'debug';
import {
  IController,
  IRouteMatch,
  IRouteMatchResult,
  Node,
  PARENT_NODE,
  IUriParams,
  IStringMap,
} from '../interfaces';
import { ensureNoDuplicatePathParams } from '../utils';
import { RouteMatch } from '../lib';
import { PRIORITY } from './nodepriorities';
import TAG from '../enums/nodetags';
import { RouterError, RouterErrorCode } from '../errors';

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
export default class RootNode<T extends IController> implements Node<T> {
  public [PARENT_NODE]: Node<T>;

  public controllers: Array<T>;

  public paramName = '';

  private uri = '';

  private id: string;

  private basePriority = 100;

  protected getNodePriority(nodeType: PRIORITY): number {
    return this.basePriority ** nodeType;
  }

  protected getTag(tag: TAG): string {
    debug('Entered getTag with tag="%s" basePriority=%s', tag, this.basePriority);
    return tag.toString();
  }

  get priority(): number {
    return this.getNodePriority(PRIORITY.ROOT);
  }

  public children: Array<Node<T>>;

  private uriPattern: string = '';

  get uriTemplate() {
    return this.uriPattern;
  }

  constructor() {
    this.children = [];
    this.controllers = [];
    this.id = TAG.ROOT_NODE;
  }

  get type() {
    return this.id;
  }

  get name() {
    return this.id;
  }

  /**
   * @param params
   */
  protected *getRouteMatchIterator(params: IUriParams): IterableIterator<IRouteMatch<T>> {
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
    return other.type === this.type;
  }

  protected *findChildMatches(uri: string, params: IUriParams): IterableIterator<IRouteMatch<T>> {
    for (const childNode of this.children) {
      yield* childNode.findRoutes(uri, params);
    }
  }

  /**
   * RootNode cannot be matched to any URI
   * it can only find match in child nodes.
   *
   * @param {string} uri
   * @param {IUriParams} params
   * @returns {IRouteMatchResult<T>}
   */
  public findRoute(uri: string, params?: IUriParams): IRouteMatchResult<T> {
    return this.findRoutes(uri, params).next().value;
  }

  public *findRoutes(uri: string, params?: IUriParams): IterableIterator<IRouteMatch<T>> {
    yield* this.findChildMatches(uri, params);
  }

  public *getAllRoutes(): IterableIterator<IRouteMatch<T>> {
    for (const ctrl of this.controllers) {
      yield new RouteMatch(this, ctrl);
    }

    for (const childNode of this.children) {
      yield* childNode.getAllRoutes();
    }
  }

  public getRouteMatchByControllerId(id: string): IRouteMatchResult<T> {
    debug('Entered getRouteMatchByControllerId in node "%s" with id="id"', this, id);

    const it = this.getAllRoutes();
    for (const routeMatch of it) {
      debug('controller="%s"', routeMatch.controller.id);
      if (routeMatch.controller.id === id) {
        return routeMatch;
      }
    }

    return undefined;
  }

  public addChildNode(node: Node<T>): Node<T> {
    debug('Entered addChildNode on node "%s" with node "%s"', this.name, node.name);
    const existingChildNode: Node<T> = this.children.find(_ => _.equals(node));
    if (existingChildNode) {
      debug(
        'Node "%s" has childNode "%s" equals to new node "%s"',
        this.name,
        existingChildNode.name,
        node.name,
      );
      return existingChildNode;
    }
    debug('No equal child node in this node="%s" for new node "%s"', this.name, node.name);

    /**
     * Validate to make sure new node does not have any
     * pathParam with the same name as any of the parent nodes
     */
    ensureNoDuplicatePathParams(this, node.paramName);

    this.children = [...this.children, node].sort(
      (node1, node2) => node2.priority - node1.priority,
    );

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
      ctrl => ctrl.equals(controller) || controller.equals(ctrl),
    );

    if (existingCtrl) {
      const error = `Duplicate_Controller_Error. Cannot add controller ${controller.id} to node ${this.name} because equal controller ${existingCtrl.id} already exists`;
      throw new RouterError(error, RouterErrorCode.DUPLICATE_CONTROLLER);
    }

    this.controllers = [...this.controllers, controller].sort(
      (ctrl1, ctrl2) => ctrl2.priority - ctrl1.priority,
    );

    return this;
  }

  makeUri(params?: IStringMap): string {
    debug('Entered RootNode makeUri with params="%O"', params);

    return this.uri;
  }
}
