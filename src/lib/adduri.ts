import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'
import {
  CATCH_ALL_PARAM_NAME,
  CatchAllNode,
  ExactMatchNode,
  PathParamNode
} from '../nodes'
import {
  BRACKET_CLOSED,
  BRACKET_OPEN,
  ROUTE_PATH_SEPARATOR,
  ROUTE_STRING_SERARATOR
} from '../interfaces'

/**
 * Read string until STRING_SEPARATOR or PATH_SEPARATOR char or until end of string.
 *
 * @param {string} s
 *
 * @returns {head, tail} head is first part of string including separator,
 * tail is rest of string
 */
export const splitBySeparator = (s: string, separators: Array<string>): { head: string, tail: string } => {

  let i,
      ch;
  let ret = {
    head: '',
    tail: ''
  }

  for (i = 0; ch = s[i++]; ch !== undefined) {
    ret.head += ch;
    if (separators.includes(ch)) {
      break;
    }
  }

  ret.tail = s.substring(i);

  return ret;
}

/**
 * Placeholder segment can be either:
 * {somename} or {somename}/
 * or with prefix article-{articleID}
 * or also with postfix latest{num}articles/
 *
 * @param {string} s
 * @returns {{paramName: string; prefix: string; postFix: string} | false}
 */
export const parsePlaceholderSegment = (s: string): { paramName: string, prefix?: string, postfix?: string } | false => {

  const bracketOpenPos = s.indexOf(BRACKET_OPEN);
  const bracketClosedPos = s.indexOf(BRACKET_CLOSED);
  const res = {
    paramName: '',
    prefix: undefined,
    postfix: undefined
  }

  if (bracketOpenPos < 0 || bracketClosedPos < 0) {
    return false
  }

  if (bracketOpenPos > bracketClosedPos) {
    return false
  }

  /**
   * segment cannot have more than one param
   * cannot be something like {category}subcategory{subcategory}
   * For multiple params path must be separated by path separator or underscore
   */

  if (s.lastIndexOf(BRACKET_OPEN) !== bracketOpenPos) {
    throw new Error(`Multiple '${BRACKET_OPEN}' chars in segment ${s}`);
  }

  if (s.lastIndexOf(BRACKET_CLOSED) !== bracketClosedPos) {
    throw new Error(`Multiple '${BRACKET_CLOSED}' chars in segment ${s}`);
  }

  res.paramName = s.substring(bracketOpenPos + 1, bracketClosedPos);
  res.prefix = s.substring(0, bracketOpenPos);
  res.postfix = s.substring(bracketClosedPos + 1);

  return res;
}

export const makeRouterNode = <T>(uriSegment: string): Node<T> => {

  let node: Node<T>;
  if (uriSegment === CATCH_ALL_PARAM_NAME) {
    node = new CatchAllNode()
  } else if (!uriSegment.includes(BRACKET_OPEN)) {
    node = new ExactMatchNode(uriSegment)
  } else if (uriSegment.includes(BRACKET_CLOSED)){
    /**
     * Validate positions of { and } chars.
     * Right now segment must start with { and end with } followed by optional separator
     * chars between { and } must be valid for param name
     */

    node = new PathParamNode()
  }

  return node;
}

export const splitUri = (uri: string): Array<string> => {

  return uri.split(/[\/_]/)
}


export const addRoute = <T>(node: Node<T>, uri: string, controller: T): void => {


}
