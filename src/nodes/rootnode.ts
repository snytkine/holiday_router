import Debug from 'debug';
import {
  IControllerContainer,
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

const debug = Debug('HOLIDAY-ROUTER:NODE:RootNode');

/**
 * @todo add getter and setter to parent node
 * throw exception is parent was already set - allow setting only once
 * and may try to use WeakMap<Node<T>> where 'this' will be a key and
 * parent node a value
 * this way a reference to parent node will not be counted for garbage collection.
 * This should not be necessary as V8 GC should easily figure our this case of
 * circular reference issue, but maybe it will help GC or may it any more efficient?
 */
export default class RootNode<T extends IControllerContainer> implements Node<T> {
  public [PARENT_NODE]: Node<T>;

  public controllers?: Array<T>;

  public paramName = '';

  private uri = '';

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
  }

  get type() {
    return this.getTag(TAG.ROOT_NODE);
  }

  get name() {
    return this.getTag(TAG.ROOT_NODE);
  }

  /**
   * @param {Node<T>} other
   * @returns {boolean}
   */
  equals(other: Node<T>): boolean {
    return other.type === this.type;
  }

  protected findChildMatches(uri: string, params: IUriParams): IRouteMatchResult<T> {
    for (let i = 0; i < this.children.length; i += 1) {
      const routeMatch = this.children[i].getRouteMatch(uri, params);
      if (routeMatch) {
        return routeMatch;
      }
    }

    return undefined;
  }

  /**
   * RootNode cannot be matched to any URI
   * it can only find match in child nodes.
   *
   * @param {string} uri
   * @param {IUriParams} params
   * @returns {IRouteMatchResult<T>}
   */
  getRouteMatch(uri: string, params: IUriParams = { pathParams: [] }): IRouteMatchResult<T> {
    return this.findChildMatches(uri, params);
  }

  public getAllRoutes(): Array<IRouteMatch<T>> {
    const res: Array<IRouteMatch<T>> = (this.controllers && [new RouteMatch(this)]) || [];

    return this.children.reduce((prev, next) => {
      return prev.concat(next.getAllRoutes());
    }, res);
  }

  public getRouteMatchByControllerId(id: string): IRouteMatchResult<T> {
    debug('Entered getRouteMatchByControllerId in node "%s" with id="id"', this, id);

    const allRoutes = this.getAllRoutes();

    return allRoutes.find(routeMatch => {
      return (
        routeMatch.node.controllers && routeMatch.node.controllers.find(ctrl => ctrl.id === id)
      );
    });
  }

  public addChildNode(node: Node<T>): Node<T> {
    debug('Entered addChildNode on node "%s" with node "%s"', this.name, node.name);
    const existingChildNode: Node<T> | undefined = this.children.find(_ => _.equals(node));
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
     * If controllers has not yet been initialized then create array with
     * this controller
     */
    if (!this.controllers) {
      debug(
        'Node="%s" addController initializing new controllers array with controller="%s',
        this.name,
        controller,
      );
      this.controllers = [controller];

      return this;
    }
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
