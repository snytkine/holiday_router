import { Node } from '../interfaces/ifnode'
import {
  RouteMatchResult,
  UriParams
} from '../interfaces'
import { PathParamNode } from './pathparamnode'

const TAG = 'PathParamBasicNodeRegex';

export class PathParamNodeRegex<T> extends PathParamNode<T> implements Node<T> {


  private regexStr: string;


  get priority() {
    return 97;
  }

  get name() {
    return `${TAG}::${this.paramName}`;
  }

  equals(other: Node<T>): boolean {
    return (other instanceof PathParamNode && other.pathSeparator === this.pathSeparator)
  }

  constructor(paramName: string, public readonly pathSeparator?: string | undefined) {
    super(paramName, pathSeparator)
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
  findRoute(uri: string, params?: UriParams): RouteMatchResult<T> {
    return undefined
  }


}
