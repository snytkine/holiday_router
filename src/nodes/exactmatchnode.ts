import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import { addToChildren } from '../lib/addtochildren'
import { printChildren } from '../lib'

const TAG = 'ExactMathNode'

/**
 * Node represents uri segment that ends with path separator
 */
export class ExactMatchNode<T> implements Node<T> {

  /**
   * The exact match segment may or may not end with path separator
   * for example it may be widgets/ or widgets
   *
   * This means that if this exact match segment is widgets
   * but user was /orders/widgets/123
   * findRoute will receive uri=widgets/ and then
   * rest will be "/" and will attempt to find "/" node in children
   */
  public origUriPattern: string;

  /**
   * Length of origUriPattern
   * Since the origUriPattern is static in this case the length
   * is constant and we can set it at time of Node creation
   */
  protected segmentLength: number

  public controller: T

  private children_: Array<Node<T>>


  constructor(uri: string) {
    this.origUriPattern = uri
    this.controller = void 0;
    this.children_ = []
    this.segmentLength = uri.length
  }


  get priority() {
    return 99
  }

  get name() {
    return `${TAG}::${this.origUriPattern}`;
  }

  equals(other: Node<T>) {
    return (other instanceof ExactMatchNode && other.origUriPattern === this.origUriPattern)
  }

  addChild(node: Node<T>) {
    this.children_ = addToChildren(this.children_, node);
  }

  findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    let i: number = 0

    let rest: string

    let childMatch: RouteMatchResult<T>

    if (uri.startsWith(this.origUriPattern)) {

      /**
       * The start of the uri matched this node
       * If this is an exact match (rest will be empty string)
       * then must have controllers
       *
       * if NOT exact match then one of the child nodes must
       * have controllers
       *
       * get the rest of the uri
       * if its empty string then we have exact math
       * in which case must have controller
       */
      rest = uri.substring(this.segmentLength)

      if (!rest) {

        return this.controller && {
          controller: this.controller,
          params
        }

      }

      /**
       * Have rest of uri
       * Loop over children to get result
       */
      while (!childMatch && i < this.children_.length) {
        childMatch = this.children_[i].findRoute(rest, params)
        i += 1
      }

      return childMatch;

    } else {
      return undefined;
    }

  }


  get children() {
    return [...this.children_]
  }

}
