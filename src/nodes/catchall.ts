import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import {
  makeParam,
  printChildren
} from '../lib'
import { addToChildren } from '../lib/addtochildren'

export const CATCH_APP_PARAM_NAME = '**';

const TAG = 'CatchAllNode';

/**
 * Node represents uri segment that ends with path separator
 */
export class CatchAllNode<T> implements Node<T> {


  private children_: Array<Node<T>> = [];


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


  public printNode(indent: number = 0) {

    return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${this.name}
    ${' '.repeat(indent * 4)} || hasController=${!!this.controller}
    ${' '.repeat(indent * 4)} || children (${this.children_.length}) =${printChildren(this.children_, indent)}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`
  }

}
