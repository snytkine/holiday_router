import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import { RootNode } from './rootnode'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'

const TAG = 'ExactMathNode'

/**
 * Node represents uri segment that ends with path separator
 */
export class ExactMatchNode<T> extends RootNode<T> implements Node<T> {

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


  constructor(uri: string) {
    super();
    this.origUriPattern = uri
    this.controller = void 0;
    this.segmentLength = uri.length
  }

  get id() {
    return 'ExactMatchNode';
  }

  /**
   * ExactMatch node should always have highest priority
   * @returns {number}
   */
  get priority() {
    return getNodePriority(PRIORITY.EXACTMATCH)
  }

  get name() {
    return `${TAG}::${this.origUriPattern}`;
  }

  equals(other: Node<T>) {
    return (other.id === this.id && other instanceof ExactMatchNode && other.origUriPattern === this.origUriPattern)
  }

  findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    let rest: string

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
      return this.findChildMatch(rest, params);

    } else {
      return false;
    }

  }

}
