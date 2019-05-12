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

  get priority() {
    return 98;
  }

  get name() {
    return `${TAG}::${this.paramName}::${this.prefix}::${this.postfix}`;
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

    return ((this.prefix === other.prefix) && (this.postfix === other.postfix));
  }


  public findRoute(uri: string,
                   params: UriParams = {
                     pathParams:  [],
                     regexParams: []
                   }): RouteMatchResult<T> {

    const extractedParam = extractUriParam(uri, this.postfix, this.prefix);

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
