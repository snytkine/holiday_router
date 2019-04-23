import {
  Node,
  URI_PATH_SEPARATOR,
} from '../interfaces/ifnode'
import {
  CATCH_ALL_PARAM_NAME,
  CatchAllNode,
  ExactMatchNode,
  PathParamNode,
} from '../nodes'
import {
  BRACKET_CLOSED,
  BRACKET_OPEN,
  ROUTE_STRING_SERARATOR,

} from '../interfaces'
import { splitBySeparator } from './strlib'

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

export type NodeFactory<T> = (uriSegment: string) => Node<T> | Error;

export const makeCatchAllNode = <T>(uriSegment: string): Node<T> | Error => {

  const re = /^{\*([^{}]+)}$/

  if (uriSegment === CATCH_ALL_PARAM_NAME) {
    return new CatchAllNode();
  }

  const res = re.exec(uriSegment);

  if (res && Array.isArray(res) && res[1]) {
    return new CatchAllNode(res[1])
  }

  return new Error(`Did not create catchAllNode from segment=${uriSegment}`);
}

export const makeExactMatchNode = <T>(uriSegment: string): Node<T> | Error => {
  /**
   * @todo
   * need some validation for allowed chars in segment
   */
  if (uriSegment !== CATCH_ALL_PARAM_NAME) {
    return new ExactMatchNode(uriSegment);
  }

  return new Error(`Did not create exactMatch node from segment=${uriSegment}`);
}

export const makePathParamNode = <T>(uriSegment: string): Node<T> | Error => {

  const re = /^{([a-zA-Z0-9-_]+)}([\/_]?)$/;

  const res = re.exec(uriSegment);

  if (!res) {
    return new Error(`Did not create pathParam node from segment=${uriSegment}`);
  }

  const [_, paramName, pathSep] = res;

  return new PathParamNode(paramName, pathSep);

}


export const makePathParamNodeRegex = <T>(uriSegment: string): Node<T> | Error => {

  const re = /^{([a-zA-Z0-9-_]+):(.*)}([\/_]?)$/;
  let regex: RegExp;

  const res = re.exec(uriSegment);

  if (!res) {
    return new Error(`Did not create pathParamRegex node from segment=${uriSegment}`);
  }

  const [_, paramName, pattern, pathSep] = res;

  try {
    regex = new RegExp(pattern);
    return new PathParamNode(paramName, pathSep, regex);
  } catch (e) {
    throw new Error(`Invalid regex pattern '${pattern}' in uriSegment=${uriSegment} e=${e}`);
  }

}


/**
 * Created new node(s) and append as child to parentNode
 *
 * @param {Node<T>} node
 * @param {string} uri
 * @param {T} controller
 */
export const makeNode = <T>(uriSegment: string): Node<T> => {

  /**
   * Array of factory functions that can create router node
   * Order is important because makeExactMatchNode will
   * create a new for PathParam node and
   * @type {<T>(uriSegment: string) => (Node<T> | false)[]}
   */
  const factories: Array<NodeFactory<T>> = [
    makeCatchAllNode,
    makePathParamNodeRegex,
    makePathParamNode,
    makeExactMatchNode,
  ];


  const ret = factories.reduce((prev, cur) => {
    if (!(prev instanceof Error)) {
      return prev;
    }
    return cur(uriSegment);
  }, new Error())


  if(ret instanceof Error){
    throw new Error(`No suitable factory function to create node from uriSegment=${uriSegment}`)
  }

  return ret;

}
