import {
  Node,
  RouteMatchResult,
  UriParams,
  makeParam,
  extractUriParam,
  copyPathParams,
} from '../'
import { RootNode } from './rootnode'

const TAG = 'PathParamNode';


/**
 * Node represents uri segment that
 * extracts pathParam and ends with path separator
 */
export class PathParamNode<T> extends RootNode<T> implements Node<T> {

  public controller: T

  protected paramName: string;

  public readonly regex: RegExp;


  /**
   * Uri segment will be something like {string} uri |{region}/ or {region}_ or {region}
   * @param {string} uri |{region}/ or {region}_ or {region}
   */
  constructor(paramName: string, public readonly pathSeparator?: string | undefined, re?: RegExp) {
    super();
    this.paramName = paramName.trim();
    this.regex = re;
  }

  get priority() {
    return 98;
  }

  get name() {
    return `${TAG}::${this.paramName}::${this.pathSeparator}`;
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
    if (!(other instanceof PathParamNode)) {
      return false
    }

    /**
     * regex can be undefined in this node or in other node
     * if typeof regex (undefined or RegExp) are not same in both nodes
     * return false
     */
    if (typeof this.regex !== typeof other.regex) {
      return false;
    }

    /**
     * If this node and other node have regex and their source property are the same
     * then nodes are considered equal
     */
    if (this.regex && other.regex && this.regex.source === other.regex.source) {
      return true;
    }

    return (!this.regex && !other.regex && other.pathSeparator === this.pathSeparator);
  }


  public findRoute(uri: string, params: UriParams = {
    pathParams:  [],
    regexParams: []
  }): RouteMatchResult<T> {

    const extractedParam = extractUriParam(uri, this.pathSeparator);

    if (!extractedParam) {
      return false;
    }

    if (!extractedParam.rest) {

      /**
       * If no tail left in search string
       * it means there are no more segments left in string to match
       * In this case this node is a complete match
       */
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

}
