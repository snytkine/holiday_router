import {
  Node,
  RouteMatchResult,
  URI_PATH_SEPARATOR,
  UriParams,
} from '../interfaces/ifnode'
import {
  makeParam,
  addToChildren,
} from '../lib'

const TAG = 'PathParamNode';

/**
 * Node represents uri segment that
 * extracts pathParam and ends with path separator
 */
export class PathParamNode<T> implements Node<T> {

  private children_: Array<Node<T>> = [];

  public controller: T


  /**
   * Uri segment will be something like {string} uri |{region}/ or {region}_ or {region}
   * @param {string} uri |{region}/ or {region}_ or {region}
   */
  constructor(private paramName: string, public readonly pathSeparator?: string | undefined) {
  }

  get priority() {
    return 98;
  }

  get name() {
    return `${TAG}::${this.paramName}`;
  }

  get children() {
    return [...this.children_]
  }

  equals(other: Node<T>) {
    return (other instanceof PathParamNode && other.pathSeparator === this.pathSeparator)
  }

  addChild(node: Node<T>) {
    this.children_ = addToChildren(this.children_, node);
  }

  findRoute(uri: string, params: UriParams = { pathParams: [] }): RouteMatchResult<T> {

    let pathParam: string = '';
    let i = 0
    let j = 0
    let ch = '';
    let rest: string;
    let childMatch: RouteMatchResult<T>

    /**
     * Read characters until end or uri or till reached pathSeparator
     * and collect these chars into string.
     *
     */
    while (ch !== undefined && ch !== URI_PATH_SEPARATOR && ch !== this.pathSeparator) {
      pathParam += uri[i]
      ch = uri[++i]
    }

    /**
     * ch points to next char after pathParam (because of ++i)
     * so if next param does not match path separator this is considered
     * as non-match
     */
    if (ch !== this.pathSeparator) {

      return undefined;

    }

    params.pathParams.push(makeParam(this.paramName, pathParam));

    rest = uri.substr(i + 1);

    if (!rest) {

      return this.controller && {
        controller: this.controller,
        params

      }

    }


    /**
     * Have rest of uri
     * Loop over children to get result
     */
    while (!childMatch && j < this.children_.length) {
      childMatch = this.children_[j].findRoute(rest, params)
      j += 1
    }

    return childMatch
  }


}
