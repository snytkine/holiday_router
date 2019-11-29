import {
  BRACKET_CLOSED,
  BRACKET_OPEN,
  CATCH_ALL_PARAM_NAME,
  IController,
  Node
} from '../interfaces'

import {
  CatchAllNode,
  ExactMatchNode,
  PathParamNode,
  PathParamNodeRegex,
} from '../nodes'
import Debug from 'debug';
const debug = Debug('GP-URI-ROUTER');

export type NodeFactory = <T extends IController>(uriSegment: string) => Node<T> | null;

export const makeCatchAllNode: NodeFactory = <T extends IController>(uriSegment: string): Node<T> => {

  /**
   * Supports named catchall parameter
   * if segment looks like this: /*someParam
   * in which case param name will be someParam
   *
   * otherwise the pattern is ** and  the paramName will be **
   * @type {RegExp}
   */
  const re = /^{\*([a-zA-Z0-9-_]+)}$/

  if (uriSegment === CATCH_ALL_PARAM_NAME) {
    return new CatchAllNode();
  }

  const res = re.exec(uriSegment);

  if (res && Array.isArray(res) && res[1]) {
    return new CatchAllNode(res[1])
  }

  return null;
}

export const makeExactMatchNode: NodeFactory = <T extends IController>(uriSegment: string): Node<T> => {

  if (uriSegment !== CATCH_ALL_PARAM_NAME) {
    return new ExactMatchNode(uriSegment);
  }

  return null;
}


export const makePathParamNode: NodeFactory = <T extends IController>(uriSegment: string): Node<T> => {

  /**
   * Prefix = anything except { and } and /
   * followed by {
   * followed by optional spaces
   * followed by param name (alphanumeric with - and _)
   * followed by optional spaces
   * followed by }
   * followed by optional postfix which will often be just path separator or some other string.
   * @type {RegExp}
   */
  const re = /^([^{}\/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*)}([^{}]*)$/;

  const res = re.exec(uriSegment);

  if (!res) {
    return null;
  }

  const [_, prefix, paramName, postfix] = res;

  return new PathParamNode(paramName, postfix, prefix);

}

/**
 * @throws SyntaxError if supplied regex pattern is invalid
 * @param {string} uriSegment
 * @returns {any}
 */
export const makePathParamNodeRegex = (uriSegment: string): any => {

  debug('makePathParamNodeRegex entered with uriSegment=%s"', uriSegment)
  /**
   * prefix - anything except { and } and /
   * followed by {
   * optionally followed by spaces
   * followed by param name (alphanumeric or dash or underscore)
   * optionally followed by spaces
   * followed by :
   * optionally followed by spaces
   * followed by regex pattern  (anything but must be valid regex pattern or exception is thrown)
   * followed by postfix = anything except {}
   *
   * @type {RegExp}
   */
  const re = /^([^{}\/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*):(.*)}([^{}]*)$/;

  const res = re.exec(uriSegment);

  if (!res) {
    debug('makePathParamNodeRegex NOT a match for uriSegment=%s"', uriSegment)
    return null;
  }

  const [_, prefix, paramName, restr, postfix] = res;

  let pattern = restr.trim();

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

  const nodeRegex = new RegExp(pattern);

  return new PathParamNodeRegex(paramName, nodeRegex, postfix, prefix);

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
export const makeNode = <T extends IController>(uriSegment: string): Node<T> => {

  let ret: Node<T>;
  let i = 0;

  do {
    ret = factories[i](uriSegment);
  } while (!ret && i++ < factories.length);

  if (!ret) {
    throw new Error(`Failed to create node for uriSegment=${uriSegment}`);
  }

  return ret;
}
