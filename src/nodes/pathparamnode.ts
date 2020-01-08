import Debug from 'debug';
import { IController, IStringMap, Node, IUriParams, IRouteMatchResult } from '../interfaces';
import RootNode from './rootnode';
import { PRIORITY } from './nodepriorities';
import TAG from '../enums/nodetags';
import { Strlib, Utils } from '../utils';
import { ExtractedPathParam, RouteMatch } from '../lib';

import { RouterError, RouterErrorCode } from '../errors';

const debug = Debug('HOLIDAY-ROUTER:node:pathparamnode');

/**
 * Node represents uri segment that
 * extracts pathParam and ends with path separator
 */
export default class PathParamNode<T extends IController> extends RootNode<T> implements Node<T> {
  public paramName: string;

  public readonly postfix: string;

  public readonly prefix: string;

  get uriTemplate() {
    return `${this.prefix}{${this.paramName}}${this.postfix}`;
  }

  /**
   * Uri segment will be something like {string} uri |{region}/ or {region}_ or {region}
   * @param {string} uri |{region}/ or {region}_ or {region}
   */
  constructor(paramName: string, postfix: string = '', prefix = '') {
    super();
    this.paramName = paramName.trim();
    this.postfix = postfix || '';
    this.prefix = prefix || '';
    debug(
      'Created node %s this.prefix="%s" this.postfix="%s" this.paramName="%s"',
      TAG,
      this.prefix,
      this.postfix,
      this.paramName,
    );
  }

  get type() {
    return this.getTag(TAG.PATHPARAM_NODE);
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
    return this.getNodePriority(PRIORITY.PATHPARAM) + this.prefix.length + this.postfix.length;
  }

  get name() {
    return `${TAG.PATHPARAM_NODE}::${this.paramName}::'${this.prefix}'::'${this.postfix}'`;
  }

  /**
   * This method is used only when adding child node
   * the purpose is to prevent adding duplicate nodes that has equal match condition
   *
   * @param {Node<T>} other
   * @returns {boolean}
   */
  public equals(other: Node<T>): boolean {
    debug(
      'entered equals on node  id="%s" name="%s" with other.id="%s" other.name="%s"',
      this.type,
      this.name,
      other.type,
      other.name,
    );
    /**
     * If other node is not PathParamNode return false
     */
    if (other.type !== this.type) {
      return false;
    }

    /**
     * Must also use .type because PathParamNodeRegex is also instanceof PathParamNode
     * Here using instanceof because otherwise typescript will
     * complain about other.prefix and other.potfix
     * if typescript not sure that other node has these props
     */
    const ret: boolean =
      other instanceof PathParamNode &&
      other.type === this.type &&
      this.prefix === other.prefix &&
      this.postfix === other.postfix;

    return ret;
  }

  public getRouteMatch(uri: string, params: IUriParams = { pathParams: [] }): IRouteMatchResult<T> {
    const extractedParam = Strlib.extractUriParam(uri, this.prefix, this.postfix);

    /**
     * If there are no extractedParam then this generator
     * will not yield anything
     */
    if (extractedParam) {
      const copiedParams = Utils.copyPathParams(
        params,
        new ExtractedPathParam(this.paramName, extractedParam.param),
      );

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
      }
      /**
       * Have rest of uri
       * Loop over children to get result
       */
      return this.findChildMatches(extractedParam.rest, copiedParams);
    }

    return undefined;
  }

  /**
   * @param params object with string keys and string values
   * @throws RouteError with RouterErrorCode.MAKE_URI_MISSING_PARAM if
   * params object does not have a key matching paramName of this node.
   * @returns string
   */
  makeUri(params: IStringMap): string {
    if (!params[this.paramName]) {
      throw new RouterError(
        `Cannot generate uri for node ${this.name} because params object missing property ${this.paramName}`,
        RouterErrorCode.MAKE_URI_MISSING_PARAM,
      );
    }

    return `${this.prefix}${params[this.paramName]}${this.postfix}`;
  }
}
