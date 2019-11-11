import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import { makeParam, } from '../lib'
import { RootNode } from './rootnode'
import { CATCH_ALL_PARAM_NAME } from '../interfaces'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'

const TAG = 'CatchAllNode';

/**
 * Node represents uri segment that ends with path separator
 */
export class CatchAllNode<T> extends RootNode<T> implements Node<T> {

  private paramName: string;
  /**
   * catchall node has lowest priority because
   * it must be the last node in children array
   * otherwise if this node is added to children before other more
   * specific nodes this node will match before other nodes
   * had a chance to run findRoute
   * @returns {number}
   */
  get priority() {
    return getNodePriority(PRIORITY.CATCHALL);
  }

  get name() {
    return `${TAG}::${this.paramName}`;
  }

  /**
   * CatchAll node MUST have controller because it cannot have
   * children nodes - that simply would not make sense because
   * this node matches any uri and will never even look children
   */
  constructor(paramName: string = CATCH_ALL_PARAM_NAME) {
    super();
    this.paramName = paramName.trim();
  }

  equals(other: Node<T>): boolean {
    return (other instanceof CatchAllNode);
  }

  addChild(node: Node<T>) {
    throw new Error(`CatchAllNode cannot have child nodes.`)
  }

  findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    params.pathParams.push(makeParam(this.paramName, uri));

    return this.controller && {
      controller: this.controller,
      params
    }
  }

}
