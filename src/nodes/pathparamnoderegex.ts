import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces'
import { PathParamNode } from './pathparamnode'
import {
  copyPathParams,
  extractUriParam,
  makeParam,
  makeRegexParam
} from '../lib'

const TAG = 'PathParamNodeRegex';

export class PathParamNodeRegex<T> extends PathParamNode<T> implements Node<T> {


  public readonly regex: RegExp;


  get priority() {
    return 97;
  }

  get name() {
    return `${TAG}::'${this.paramName}'::'${this.regex.source}'::'${this.prefix}'::'${this.postfix}'`;
  }

  equals(other: Node<T>): boolean {

    return (
      (other instanceof PathParamNodeRegex) &&
      (this.prefix === other.prefix) &&
      (this.postfix === other.postfix) &&
      (this.regex.source === other.regex.source)
    )
  }

  constructor(paramName: string, re: RegExp, postfix: string = '', prefix = '') {
    super(paramName, postfix, prefix);
    this.regex = re;
  }

  private match(uriSegment: string): Array<string> | false {

    const res = this.regex.exec(uriSegment);

    return res || false;
  }

  /**
   * @todo implement this by extracting pathParam first and then
   * calling regex method on it and if regex does not match
   * then return undefined
   *
   * @param {string} uri
   * @param {UriParams} params
   * @returns {RouteMatchResult<T>}
   */
  findRoute(uri: string,
            params: UriParams = {
              pathParams:  [],
              regexParams: []
            }): RouteMatchResult<T> {



    const extractedParam = extractUriParam(uri, this.postfix, this.prefix);

    if (!extractedParam) {

      return false;
    }

    const regexParams = this.match(extractedParam.param);

    if (!regexParams) {

      return false;
    }

    /**
     *
     * if only 1 match was extracted then
     * the order of matched elements is off?
     * the array will have only one element (at 0)
     * instead of normal 0 for whole string match and 1 for first extracted match
     *
     */

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
        params:     copyPathParams(params, makeParam(this.paramName, extractedParam.param), makeRegexParam(this.paramName, regexParams))
      }

    }

    return this.findChildMatch(
      extractedParam.rest,
      copyPathParams(params, makeParam(this.paramName, extractedParam.param), makeRegexParam(this.paramName, regexParams))
    );

  }


}
