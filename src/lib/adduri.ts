import {
  BRACKET_CLOSED,
  BRACKET_OPEN,
  CATCH_ALL_PARAM_NAME,
  Node
} from '../interfaces'

import {
  CatchAllNode,
  ExactMatchNode,
  PathParamNode,
  PathParamNodeRegex,
} from '../nodes'


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
    prefix:    undefined,
    postfix:   undefined
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

export type NodeFactory = <T>(uriSegment: string) => Node<T> | null;


export const makeCatchAllNode: NodeFactory = <T>(uriSegment: string): Node<T> => {

  const re = /^{\*([^{}]+)}$/

  if (uriSegment === CATCH_ALL_PARAM_NAME) {
    return new CatchAllNode();
  }

  const res = re.exec(uriSegment);

  if (res && Array.isArray(res) && res[1]) {
    return new CatchAllNode(res[1])
  }

  return null;
}

export const makeExactMatchNode: NodeFactory = <T>(uriSegment: string): Node<T> => {
  /**
   * @todo
   * need some validation for allowed chars in segment
   */
  if (uriSegment !== CATCH_ALL_PARAM_NAME) {
    return new ExactMatchNode(uriSegment);
  }

  return null;
}

export const makePathParamNode: NodeFactory = <T>(uriSegment: string): Node<T> => {

  const re = /^{([a-zA-Z0-9-_]+)}([\/_]?)$/;

  const res = re.exec(uriSegment);

  if (!res) {
    return null;
  }

  const [_, paramName, pathSep] = res;

  return new PathParamNode(paramName, pathSep);

}

/**
 *
 * @param {string} uriSegment
 * @returns {Node<T>}
 * @throws Exception in case the regex string is not a valid regex.
 */
export const makePathParamNodeRegex: NodeFactory = <T>(uriSegment: string): Node<T> => {
  /**
   * curly brace followed by optional spaces
   * then alphanumeric string for param name then colon followed by
   * string of any chars followed by optional path separator '/' or string delimeter '_'
   *
   * @type {RegExp}
   */
  const re = /^{(?:\s*)([a-zA-Z0-9-_]+):(.*)}([\/_]?)$/;
  let regex: RegExp;

  const res = re.exec(uriSegment);

  if (!res) {
    return null;
  }

  let [_, paramName, pattern, pathSep] = res;

  pattern = pattern.trim();

  /**
   * Implicitly add the '^' to start of regex if it's not
   * already the start of regex and $ to end of regex if it's not
   * already ends with $ but if regex ends with escaped \$ then
   * it is a literal dollar sign, must still add $
   */
  if (!pattern.startsWith('^')) {
    pattern = '^' + pattern;
  }

  if (!pattern.endsWith('$') || pattern.endsWith('\\$')) {
    pattern = pattern + '$';
  }

  try {
    regex = new RegExp(pattern);

    return new PathParamNodeRegex(paramName, regex, pathSep);
  } catch (e) {
    throw new Error(`Invalid regex pattern '${pattern}' in uriSegment=${uriSegment} e=${e}`);
  }

}

/**
 * Array of factory functions that can create router node
 * Order is important because makeExactMatchNode will
 * create a new for PathParam node and
 * @type {<T>(uriSegment: string) => (Node<T> | false)[]}
 */
const factories: Array<NodeFactory> = [
  makeCatchAllNode,
  makePathParamNodeRegex,
  makePathParamNode,
  makeExactMatchNode,
];

/**
 * Created new node(s) and append as child to parentNode
 *
 * @param {Node<T>} node
 * @param {string} uri
 * @param {T} controller
 */
export const makeNode = <T>(uriSegment: string): Node<T> => {

  let ret: Node<T>;
  let i = 0;

  do {
    ret = factories[i](uriSegment);
  } while (!ret && i++ < factories.length);

  if(!ret){
    throw new Error(`Failed to create node for uriSegment=${uriSegment}`);
  }

  return ret;
}
