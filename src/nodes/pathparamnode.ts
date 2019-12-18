import {
  copyPathParams,
  extractUriParam,
  IController,
  IRouteMatch,
  IStringMap,
  makeParam,
  Node,
  RouterError,
  RouterErrorCode,
  TAG,
  UriParams,
} from '../'
import { RootNode } from './rootnode'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'
import Debug from 'debug';

const debug = Debug('GP-URI-ROUTER:node:pathparamnode');


/**
 * Node represents uri segment that
 * extracts pathParam and ends with path separator
 */
export class PathParamNode<T extends IController> extends RootNode<T> implements Node<T> {

  public paramName: string;

  public readonly postfix: string;

  public readonly prefix: string;

  /**
   * Uri segment will be something like {string} uri |{region}/ or {region}_ or {region}
   * @param {string} uri |{region}/ or {region}_ or {region}
   */
  constructor(paramName: string, postfix: string = '', prefix = '') {
    super();
    this.paramName = paramName.trim();
    this.postfix = postfix || '';
    this.prefix = prefix || '';
    debug('Created node %s this.prefix="%s" this.postfix="%s" this.paramName="%s"', TAG, this.prefix, this.postfix, this.paramName)
  }

  get type() {
    return TAG.PATHPARAM_NODE;
  }

  get priority() {
    /**
     * node with prefix and/or postfix must have higher priority
     * otherwise the node without prefix will match first before
     * node with prefix even has a chance to be tested.
     *
     * @todo param with longer prefix should have priority over shorter prefix
     * example widgets-{id}  should be higher than widget-{id}
     */
    return getNodePriority(PRIORITY.PATHPARAM) + this.prefix.length + this.postfix.length;
  }

  get name() {
    return `${TAG}::${this.paramName}::'${this.prefix}'::'${this.postfix}'`;
  }

  /**
   * This method is used only when adding child node
   * the purpose is to prevent adding duplicate nodes that has equal match condition
   *
   * @param {Node<T>} other
   * @returns {boolean}
   */
  public equals(other: Node<T>) {
    debug('entered equals on node  id="%s" name="%s" with other.id="%s" other.name="%s"', this.type, this.name, other.type, other.name);
    /**
     * If other node is not PathParamNode return false
     */
    if (other.type !== this.type) {

      return false
    }

    const ret = (other instanceof PathParamNode && (this.prefix === other.prefix) && (this.postfix === other.postfix));

    return ret;
  }

  public* findRoutes(uri: string,
                     params: UriParams = {
                       pathParams:  [],
                       regexParams: []
                     }): IterableIterator<IRouteMatch<T>> {

    const extractedParam = extractUriParam(uri, this.prefix, this.postfix);

    /**
     * If there are no extractedParam then this generator
     * will not yield anything
     */
    if (extractedParam) {
      const copiedParams = copyPathParams(params, makeParam(this.paramName, extractedParam.param));

      if (!extractedParam.rest) {
        /**
         * If no tail left in search string
         * it means there are no more segments left in string to match
         * In this case this node is a complete match
         */
        yield* this.getRouteMatchIterator(copiedParams)
      } else {
        yield* this.findChildMatches(extractedParam.rest, copiedParams);
      }

    }
  }

  makeUri(params: IStringMap): string {

    if(!params.hasOwnProperty(this.paramName)){
      throw new RouterError(`Cannot generate uri for node ${this.name} because params object missing property ${this.paramName}`, RouterErrorCode.MAKE_URI_MISSING_PARAM)
    }

    return `${this.prefix}${params[this.paramName]}${this.postfix}`;
  }

}
