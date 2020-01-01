import Debug from 'debug';
import { IController, IRouteMatch, IStringMap, Node, IUriParams, IRouteMatchResult } from '../interfaces';
import PathParamNode from './pathparamnode';
import { Utils, Strlib } from '../utils';
import { ExtractedPathParam, ExtractedRegexParams, RouteMatch } from '../lib';
import { PRIORITY } from './nodepriorities';
import TAG from '../enums/nodetags';
import { RouterError, RouterErrorCode } from '../errors';

const debug = Debug('GP-URI-ROUTER:node:pathparamnoderegex');

export default class PathParamNodeRegex<T extends IController> extends PathParamNode<T>
  implements Node<T> {
  public readonly regex: RegExp;

  private readonly template: string;

  get type() {
    return this.getTag(TAG.PATHPARAM_REGEX_NODE);
  }

  get priority() {
    return this.getNodePriority(PRIORITY.REGEX) + this.prefix.length + this.postfix.length;
  }

  get name() {
    return `${TAG.PATHPARAM_REGEX_NODE}::'${this.paramName}'::'${this.regex.source}'::'${this.prefix}'::'${this.postfix}'`;
  }

  get uriTemplate() {
    return this.template;
  }

  equals(other: Node<T>): boolean {
    return (
      other.type === this.type &&
      other instanceof PathParamNodeRegex &&
      this.prefix === other.prefix &&
      this.postfix === other.postfix &&
      this.regex.source === other.regex.source
    );
  }

  /**
   *
   * @param uriPattern
   * @param paramName
   * @param re
   * @param postfix
   * @param prefix
   */
  constructor(
    uriPattern: string,
    paramName: string,
    re: RegExp,
    postfix: string = '',
    prefix: string = '',
  ) {
    super(paramName, postfix, prefix);
    this.template = uriPattern;
    this.regex = re;
    debug(
      'Created node %s this.prefix="%s" this.postfix="%s" this.paramName="%s" this.regex="%s"',
      TAG,
      this.prefix,
      this.postfix,
      this.paramName,
      this.regex.source,
    );
  }

  public match(uriSegment: string): Array<string> | false {
    const res = this.regex.exec(uriSegment);

    return res || false;
  }

  public getRouteMatch(uri: string, params?: IUriParams): IRouteMatchResult<T> {
    const extractedParam = Strlib.extractUriParam(uri, this.prefix, this.postfix);

    if (extractedParam) {
      const regexParams = this.match(extractedParam.param);

      if (regexParams) {
        const copiedParams = Utils.copyPathParams(
          params,
          new ExtractedPathParam(this.paramName, extractedParam.param),
          new ExtractedRegexParams(this.paramName, regexParams),
        );

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
          if (!this.controllers) {
            return undefined;
          }

          return new RouteMatch(this, copiedParams);
        } else {
          return this.findChildMatches(extractedParam.rest, copiedParams);
        }
      }
    }

    return undefined;
  }

  makeUri(params: IStringMap): string {
    if (!params[this.paramName]) {
      throw new RouterError(
        `Cannot generate uri for node ${this.name} because params object missing property ${this.paramName}`,
        RouterErrorCode.MAKE_URI_MISSING_PARAM,
      );
    }

    if (!this.regex.test(params[this.paramName])) {
      throw new RouterError(
        `Cannot generate uri for node ${this.name} because value of param ${this.paramName} "${
          params[this.paramName]
        }" does not pass regex ${this.regex.source}`,
        RouterErrorCode.MAKE_URI_REGEX_FAIL,
      );
    }

    return `${this.prefix}${params[this.paramName]}${this.postfix}`;
  }
}
