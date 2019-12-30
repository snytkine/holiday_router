import Debug from 'debug';
import { CATCH_ALL_PARAM_NAME, IController, Node } from './interfaces';

import { CatchAllNode, ExactMatchNode, PathParamNode, PathParamNodeRegex } from './nodes';

const debug = Debug('GP-URI-ROUTER:lib');

export type NodeFactory = <T extends IController>(uriSegment: string) => Node<T> | null;

/**
 * Supports named catchall parameter
 * if segment looks like this: /*someParam
 * in which case param name will be someParam
 *
 * otherwise the pattern is ** and  the paramName will be **
 * @type {RegExp}
 */
const CatchAllRe = /^{\*([a-zA-Z0-9-_]+)}$/;

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
const PathParamRe = /^([^{}/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*)}([^{}]*)$/;

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
const PathParamRegexRe = /^([^{}/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*):(.*)}([^{}]*)$/;

export const makeExactMatchNode: NodeFactory = <T extends IController>(
  uriSegment: string,
): Node<T> => {
  if (uriSegment !== CATCH_ALL_PARAM_NAME) {
    /**
     * @todo should the uri be validated or should
     * we allow any characters in the uri segment?
     * At the very least we should not allow segment to start with PATH_SEPARATOR
     * but we should allow uriSegment to be a PATH_SEPARATOR
     * @param uri
     */
    return new ExactMatchNode(uriSegment);
  }

  return null;
};

export const makeCatchAllNode: NodeFactory = <T extends IController>(
  uriSegment: string,
): Node<T> => {
  if (uriSegment === CATCH_ALL_PARAM_NAME) {
    return new CatchAllNode();
  }

  const res = CatchAllRe.exec(uriSegment);

  if (res && Array.isArray(res) && res[1]) {
    return new CatchAllNode(res[1]);
  }

  return null;
};

export const makePathParamNode: NodeFactory = <T extends IController>(
  uriSegment: string,
): Node<T> => {
  const res = PathParamRe.exec(uriSegment);

  if (!res) {
    return null;
  }

  const [, prefix, paramName, postfix] = res;

  return new PathParamNode(paramName, postfix, prefix);
};

/**
 * @throws SyntaxError if supplied regex pattern is invalid
 * @param {string} uriSegment
 * @returns {any}
 */
export const makePathParamNodeRegex = (uriSegment: string): any => {
  debug('makePathParamNodeRegex entered with uriSegment=%s"', uriSegment);

  const res = PathParamRegexRe.exec(uriSegment);

  if (!res) {
    debug('makePathParamNodeRegex NOT a match for uriSegment=%s"', uriSegment);
    return null;
  }

  const [, prefix, paramName, restr, postfix] = res;

  let pattern = restr.trim();

  /**
   * Implicitly add the '^' to start of regex if it's not
   * already the start of regex and $ to end of regex if it's not
   * already ends with $ but if regex ends with escaped \$ then
   * it is a literal dollar sign, must still add $
   */
  if (!pattern.startsWith('^')) {
    pattern = `^${pattern}`;
  }

  if (!pattern.endsWith('$') || pattern.endsWith('\\$')) {
    pattern += '$';
  }

  const nodeRegex = new RegExp(pattern);

  return new PathParamNodeRegex(paramName, nodeRegex, postfix, prefix);
};

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
    i += 1;
  } while (!ret && i < factories.length);

  return ret;
};
