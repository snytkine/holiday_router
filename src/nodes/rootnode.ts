import {
  Node,
  ROUTE_PATH_SEPARATOR,
  ROUTE_STRING_SERARATOR,
  RouteMatchResult,
  UriParams
} from '../interfaces'
import {
  makeNode,
  printNode,
  splitBySeparator
} from '../lib'


export class RootNode<T> implements Node<T> {

  public controller: T;

  get priority(): number {
    return 0;
  }

  get name(): string {
    return 'RootNode';
  }

  public children: Array<Node<T>>;

  constructor() {
    this.children = [];
  }

  equals(other: Node<T>): boolean {
    return (other instanceof RootNode);
  }

  protected findChildMatch(uri: string, params: UriParams) {

    let childMatch: RouteMatchResult<T>;
    let i = 0;
    /**
     * Have rest of uri
     * Loop over children to get result
     */
    while (!childMatch && i < this.children.length) {
      childMatch = this.children[i].findRoute(uri, params)
      i += 1
    }

    return childMatch;
  }

  /**
   * RootNode cannot be matched to any URI
   * it can only find match in child nodes.
   *
   * @param {string} uri
   * @param {UriParams} params
   * @returns {RouteMatchResult<T>}
   */
  public findRoute(uri: string, params?: UriParams): RouteMatchResult<T> {
    return this.findChildMatch(uri, params);
  }

  /**
   * Given the URI and controller:
   * extract path segment from uri,
   * make a node from extracted segment
   * Add node as a child node.
   *
   * if no 'tail' after extracting uri segment
   * then also add controller to this child node.
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
      this.controller = controller;
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
      if(tail) {
        return existingChildNode.addUriController(tail, controller)
      } else {
        /**
         * No tail
         * if same node already exists and has controller then throw
         */
        if(existingChildNode.controller){

          throw new Error(`Cannot add node '${childNode.name}' because equal child node already exists in children array ${printNode(existingChildNode)}`);
        } else {
          /**
           * Same child node exists but does not have controller
           * then just add controller to it
           */
          existingChildNode.controller = controller;

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
