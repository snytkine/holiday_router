import {
  Node,
  ROUTE_PATH_SEPARATOR,
  ROUTE_STRING_SERARATOR,
  RouteMatchResult,
  UriParams
} from '../interfaces'
import { makeNode, splitBySeparator } from '../lib'


export class RootNode<T> implements Node<T> {

  public controller: T;

  get priority(): number {
    return 99;
  }

  get name(): string {
    return 'RootNode';
  }

  public children: Array<Node<T>>;

  constructor() {
    this.children = [];
  }

  equals(other: Node<T>): boolean {
    return false
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
     * then return result of invoking addUriController method
     * on the matched child node with tail as uri parameter
     */
    const existingChildNode: Node<T> = this.children.find(node => node.equals(childNode));

    if (existingChildNode) {
      return existingChildNode.addUriController(tail, controller)
    } else {
      this.addChild(childNode);

      return childNode.addUriController(tail, controller)
    }
  }

  public addChild(node: Node<T>) {

    if (this.children.find(child => child.equals(node))) {
      throw new Error(`Cannot add node '${node.name}' because equal child node already exists in children array ${JSON.stringify(this.children)}`);
    }

    this.children = [...this.children, node].sort((node1, node2) => node2.priority - node1.priority);
  }

}
