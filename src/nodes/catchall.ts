import Debug from 'debug';
import {
  IController,
  IRouteMatch,
  IStringMap,
  Node,
  IUriParams,
  CATCH_ALL_PARAM_NAME,
} from '../interfaces';
import { RootNode } from './rootnode';

import { getNodePriority, PRIORITY } from './nodepriorities';
import { TAG } from '../enums';
import { RouterError, RouterErrorCode } from '../errors';
import { ExtractedPathParam } from '../lib';

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

  get type() {
    return TAG.CATCHALL_NODE;
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
    return other instanceof CatchAllNode;
  }

  public *findRoutes(
    uri: string,
    params: IUriParams = { pathParams: [] },
  ): IterableIterator<IRouteMatch<T>> {
    debug(
      'Entered %s findRoutes with uri="%s", params=%O controllers=%O',
      TAG.CATCHALL_NODE,
      uri,
      params,
      this.controllers,
    );
    params.pathParams.push(new ExtractedPathParam(this.paramName, uri));

    yield* this.getRouteMatchIterator(params);
  }

  /**
   * Catchall node cannot have child nodes
   * Must throw exception
   *
   * @param node
   */
  addChildNode(node: Node<T>): Node<T> {
    throw new RouterError(
      `Catchall node ${this.name} cannot have child nodes. Attempted to add node ${node.name}`,
      RouterErrorCode.ADD_CHILD_CATCHALL,
    );
  }

  makeUri(params: IStringMap): string {
    if (!params[this.paramName]) {
      throw new RouterError(
        `params object passed to makeUri method of ${this.name} node is missing property ${this.paramName}`,
        RouterErrorCode.MAKE_URI_MISSING_PARAM,
      );
    }

    return params[this.paramName];
  }
}
