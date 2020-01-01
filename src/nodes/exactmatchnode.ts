import Debug from 'debug';
import { IController, IStringMap, Node, IUriParams, IRouteMatchResult } from '../interfaces/ifnode';
import RootNode from './rootnode';
import { PRIORITY } from './nodepriorities';
import TAG from '../enums/nodetags';
import { RouteMatch } from '../lib';

const debug = Debug('GP-URI-ROUTER:node:exactmatch');

/**
 * Node represents uri segment that ends with path separator
 */
export default class ExactMatchNode<T extends IController> extends RootNode<T> implements Node<T> {
  /**
   * The exact match segment may or may not end with path separator
   * for example it may be widgets/ or widgets
   *
   * This means that if this exact match segment is widgets
   * but user was /orders/widgets/123
   * findRoute will receive uri=widgets/ and then
   * rest will be "123" and will attempt to find "123" node in children
   *
   * @todo what's the reason for this being public? Try to make it private
   */
  public origUriPattern: string;

  /**
   * Length of origUriPattern
   * Since the origUriPattern is static in this case the length
   * is constant and we can set it at time of Node creation
   */
  protected segmentLength: number;

  get uriTemplate() {
    return this.origUriPattern;
  }

  constructor(uri: string) {
    super();
    this.origUriPattern = uri;
    this.segmentLength = uri.length;

    debug(
      'Created node %s this.origUriPattern="%s" this.segmentLength="%s"',
      TAG,
      this.origUriPattern,
      this.segmentLength,
    );
  }

  get type() {
    return this.getTag(TAG.EXACTMATCH_NODE);
  }

  /**
   * ExactMatch node should always have highest priority
   * @returns {number}
   */
  get priority() {
    return this.getNodePriority(PRIORITY.EXACTMATCH);
  }

  get name() {
    return `${TAG.EXACTMATCH_NODE}::${this.origUriPattern}`;
  }

  equals(other: Node<T>) {
    return (
      other.type === this.type &&
      other instanceof ExactMatchNode &&
      other.origUriPattern === this.origUriPattern
    );
  }

  public getRouteMatch(uri: string, params?: IUriParams): IRouteMatchResult<T> {
    /**
     * If not starts with origUriPattern then will not yield anything
     */
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
      const rest = uri.substring(this.segmentLength);

      /**
       * uri matched the uri of this node and
       * there are no additional string
       * Just yield* to controllers array iterator
       */
      if (!rest) {
        if (!this.controllers) {
          return undefined;
        }

        /**
         * @todo maybe don't need to pass this.controllers since already
         * passing a node. If we have node then we don't even need to have controllers separately in it.
         */
        return new RouteMatch(this, params);
      }
      /**
       * Have rest of uri
       * Loop over children to get result
       */
      return this.findChildMatches(rest, params);
    }

    return undefined;
  }

  makeUri(params: IStringMap): string {
    debug('Entered %s makeUri with params="%o"', this.name, params);
    return this.origUriPattern;
  }
}
