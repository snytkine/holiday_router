import {
  Node,
  RouteMatchResult,
  URI_PATH_SEPARATOR,
  UriParams,
} from '../interfaces/ifnode'
import {
  makeParam,
  addToChildren,
  extractUriParam,
} from '../lib'
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
    return 98 + ((this.regex) ? -1 : 0);
  }

  get name() {
    let s = '';
    if (this.regex) {
      s += this.regex.source;
    }
    let ret = `${TAG}::${this.paramName}::${s}${this.pathSeparator}`;

    return ret;
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

    return (!this.regex && !other.regex && other.pathSeparator === this.pathSeparator)
  }

  public findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    const extractedParam = extractUriParam(uri, this.pathSeparator);

    if (!extractedParam) {
      return undefined
    }

    if (this.regex && !this.regex.test(extractedParam.param)) {
      return false;
    }

    /**
     * Cannot add extracted pathParams to original params object - must make copy
     * because if there is no match in child nodes this method will return false - no match
     * but if we add to original params the extracted value will be passed
     * to next sibling node's findRoute
     *
     * @todo should have helper function copyPathParams - pass orig and new pathParam
     * @type {{pathParams: (any | {paramName: string; paramValue: string})[]}}
     */
    const myParams = { pathParams: [...params.pathParams, makeParam(this.paramName, extractedParam.param)] };//params.pathParams.push(makeParam(this.paramName,
                                                                                                             // extractedParam.param));
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
        params: myParams
      }

    }

    return this.findChildMatch(extractedParam.rest, myParams);
  }

}
