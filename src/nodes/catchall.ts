import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import {
  makeParam,
} from '../lib'


export const CATCH_APP_PARAM_NAME = '**';

const TAG = 'CatchAllNode';

/**
 * Node represents uri segment that ends with path separator
 */
export class CatchAllNode<T> implements Node<T> {

  /**
   * catchall node has lowest priority because
   * it must be the last node in children array
   * otherwise if this node is added to children before other more
   * specific nodes this node will match before other nodes
   * had a chance to run findRoute
   * @returns {number}
   */
  get priority() {
    return 1;
  }

  get name() {
    return TAG;
  }

  /**
   * CatchAll node MUST have controller because it cannot have
   * children nodes - that simply would not make sense because
   * this node matches any uri and will never even look children
   */
  constructor(public controller: T) {
  }

  equals(other: Node<T>): boolean {
    return (other instanceof CatchAllNode);
  }

  addChild(node: Node<T>) {
    throw new Error(`CatchAllNode cannot have child nodes.`)
  }

  findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    params.pathParams.push(makeParam(CATCH_APP_PARAM_NAME, uri));

    return this.controller && {
      controller: this.controller,
      params
    }
  }

  /**
   *Catchall node cannot have any children
   * @returns {any[]}
   */
  get children() {
    return [];
  }

}
