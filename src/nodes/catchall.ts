import {
  IController,
  IStringMap,
  Node,
  IRouteMatch,
  IRouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import { makeParam, } from '../lib'
import { RootNode } from './rootnode'
import { CATCH_ALL_PARAM_NAME } from '../interfaces'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'
import { TAG } from '../enums';
import Debug from 'debug';

const debug = Debug('GP-URI-ROUTER:node:catchallnode');

/**
 * Node represents uri segment that ends with path separator
 */
export class CatchAllNode<T extends IController> extends RootNode<T> implements Node<T> {

  public paramName: string;

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
    return `${TAG.CATCHALL_NODE}::${this.paramName}`;
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


  public* findRoutes(uri: string, params: UriParams = { pathParams: [] }): IterableIterator<IRouteMatch<T>> {
    debug('Entered %s findRoutes with uri="%s", params=%O controllers=%O', TAG.CATCHALL_NODE, uri, params, this.controllers);
    params.pathParams.push(makeParam(this.paramName, uri));

    yield* this.getRouteMatchIterator(params);
  }

  makeUri(params: IStringMap): string {

    if (!params.hasOwnProperty(this.paramName)) {
      throw new Error(`Cannot generate uri for node ${this.name} because params object missing property ${this.paramName}`)
    }

    return params[this.paramName];
  }

}
