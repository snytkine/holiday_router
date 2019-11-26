import {
  Node,
  RouteMatchResult,
  UriParams,
  makeParam,
  extractUriParam,
  copyPathParams,
  IController,
  RouteMatch,
} from '../'
import { RootNode } from './rootnode'
import {
  getNodePriority,
  PRIORITY
} from './nodepriorities'

const TAG = 'PathParamNode';


/**
 * Node represents uri segment that
 * extracts pathParam and ends with path separator
 */
export class PathParamNode<T extends IController> extends RootNode<T> implements Node<T> {

  protected paramName: string;

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
  }

  get id() {
    return 'PathParamNode';
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

    /**
     * If other node is not PathParamNode return false
     */
    if (other.id !== this.id) {
      return false
    }

    return (other instanceof PathParamNode && (this.prefix === other.prefix) && (this.postfix === other.postfix));
  }

  /*

   public findRoute(uri: string,
   params: UriParams = {
   pathParams:  [],
   regexParams: []
   }): RouteMatchResult<T> {

   const extractedParam = extractUriParam(uri, this.prefix, this.postfix);

   if (!extractedParam) {
   return false;
   }

   if (!extractedParam.rest) {

   /!**
   * If no tail left in search string
   * it means there are no more segments left in string to match
   * In this case this node is a complete match
   *!/
   if (!this.controller) {
   return false;
   }

   return {
   controller: this.controller,
   params:     copyPathParams(params, makeParam(this.paramName, extractedParam.param))
   }

   }

   return this.findChildMatch(extractedParam.rest, copyPathParams(params, makeParam(this.paramName, extractedParam.param)));
   }
   */


  public* findRoutes(uri: string,
                     params: UriParams = {
                       pathParams:  [],
                       regexParams: []
                     }): IterableIterator<RouteMatch<T>> {

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
        yield* this.controllersWithParams(this.controllers, copiedParams)
      } else {
        yield* this.findChildMatches(extractedParam.rest, copiedParams);
      }

    }
  }

}
