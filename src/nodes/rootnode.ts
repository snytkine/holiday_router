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
  printNode,
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

  get id() {
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
  protected* controllersWithParams(controllers: Array<T>, params: UriParams) {
    for (const controller of controllers) {
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
  equals(other: Node<T>):
    boolean {
    return (other.id === this.id);
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
  public findRoute(uri: string, params?: UriParams): RouteMatch<T> | false | undefined {
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

  /**
   * Given the URI and controller:
   * extract path segment from uri,
   * make a node from extracted segment
   * Add node as a child node.
   *
   * if no 'tail' after extracting uri segment
   * then also add controller to that child node.
   *
   * if child node already exists:
   * if no tail:
   *  if child node does not have controller
   *   then add controller to it
   *  else throw
   * else have tail
   *  call childNode.addUriController with tail
   *
   * @param {string} uri
   * @param {T} controller
   * @param fullUri: string should not be passed manually. It is passed automatically
   * by parent node to child node so that child nodes have access to the full uri in case
   * it needs it to throw exception. This is used for informational purposes in the exception message
   *
   * @returns {Node<T>}
   */
  public addUriController(uri: string, controller: T, fullUri: string = ''): Node<T> {
    fullUri = fullUri || uri;
    /**
     * @todo remove the checking existing child node controllers
     * Simplify this method:
     * if uri is empty then:
     *    has equal controller -> exception
     *    else -> add controller to this node
     * else:
     *    split uri, make node from head.
     *    addChildNode
     *    call addUriController on child node, passing tail and controller
     */
    if (!uri) {
      //this.controller = controller;
      //@todo this is wrong. Must check for existing equal controller.
      this.controllers = [...this.controllers, controller].sort((ctrl1, ctrl2) => ctrl2.priority - ctrl1.priority);
      return this;
    }

    let { head, tail } = splitBySeparator(uri, [ROUTE_PATH_SEPARATOR]);

    let childNode = makeNode<T>(head);

    /**
     * Loop over children.
     * If child matching this new node already exists
     *
     * then return result of invoking addUriController method
     * on the matched child node with tail as uri parameter
     */
    const existingChildNode: Node<T> = this.children.find(node => node.equals(childNode));

    if (existingChildNode) {
      if (tail) {
        return existingChildNode.addUriController(tail, controller, fullUri)
      } else {
        /**
         * Must check if existing node equals to this node AND if this node
         * is equals to existing node because it's possible that existing node
         * is not equals to this controller but this controller is a type of controller that
         * returns true from its equals() method (for example UniqueController)
         */
        const existingCtrl = existingChildNode.controllers.find(
          ctrl => ctrl.equals(controller) || controller.equals(ctrl));
        /**
         * No tail
         * if same node already exists and has equal controller then throw
         */
        if (existingCtrl) {

          throw new Error(`Cannot add controller "${controller.id}" for uri "${fullUri}" to child node "${childNode.name}" because equal controller "${existingCtrl.id}" already exists in node`);
        } else {
          /**
           * Same child node exists but does not have same controller
           * then just add controller to it
           */
          existingChildNode.addUriController('', controller);

          return existingChildNode;
        }
      }
    } else {
      /**
       * add this child node to children
       * then invoke addUriController on this child node with tail
       */
      this.addChild(childNode);

      return childNode.addUriController(tail, controller)
    }
  }

  public addRoute(uri: string, controller: T): Node<T> {

    debug('Entered addRoute on node="%s" with uri="%s" controller="%s', this.name, uri, controller.id);

    if (!controller[SYM_CONTROLLER_URI]) {
      controller[SYM_CONTROLLER_URI] = uri;
      debug('Added SYM_CONTROLLER_URI "%s" to controller "%s"', controller[SYM_CONTROLLER_URI], controller.id)
    }

    if (!uri) {
      return this.addController(controller);
    }

    const { head, tail } = splitBySeparator(uri, [ROUTE_PATH_SEPARATOR]);

    const childNode = makeNode<T>(head);

    return this.addChildNode(childNode).addRoute(tail, controller)

  }

  /**
   * @todo throw exception if equal child node already exists
   *
   * @param node
   */
  public addChild(node: Node<T>) {
    this.children = [...this.children, node].sort((node1, node2) => node2.priority - node1.priority);
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
      debug(error)
      throw new Error(error);
    }

    this.controllers = [...this.controllers, controller].sort((ctrl1, ctrl2) => ctrl2.priority - ctrl1.priority);

    return this;
  }

}
