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
   * @returns {Node<T>}
   */
  public addUriController(uri: string, controller: T): Node<T> {

    if (!uri) {
      //this.controller = controller;
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
        return existingChildNode.addUriController(tail, controller)
      } else {
        /**
         * No tail
         * if same node already exists and has equal controller then throw
         */
        if (existingChildNode.controllers.find(ctrl => ctrl.equals(controller))) {

          throw new Error(`Cannot add node '${childNode.name}' because equal child node already exists in children array ${printNode(existingChildNode)}`);
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

  public addChild(node: Node<T>) {
    this.children = [...this.children, node].sort((node1, node2) => node2.priority - node1.priority);
  }

}
