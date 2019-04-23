import {
  Node,
  URI_PATH_SEPARATOR
} from '../interfaces/ifnode'
import {
  ROUTE_STRING_SERARATOR,
  RouteMatchResult,
  UriParams
} from '../interfaces'
import { makeNode } from '../lib/adduri'
import { splitBySeparator } from '../lib/strlib'
import { addToChildren } from '../lib'


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

    let { head, tail } = splitBySeparator(uri, [URI_PATH_SEPARATOR, ROUTE_STRING_SERARATOR]);

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
    this.children = addToChildren(this.children, node);
  }

}
