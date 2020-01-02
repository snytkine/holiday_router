import Debug from 'debug';
import { IController, IStringMap, Node, PARENT_NODE } from '../interfaces';

const debug = Debug('HOLIDAY-ROUTER:lib');

/**
 *
 * @param node
 * @param params object
 * @param res string used
 *            only in recursive calls.
 *            Should not pass any value manually!
 *
 * @returns string
 */
export const makeUrl = <T extends IController>(
  node: Node<T>,
  params: IStringMap,
  res: string = '',
): string => {
  debug('Entered makeUri with node "%s" params="%o"', node.name, params);

  const ret = node.makeUri(params) + res;

  if (!node[PARENT_NODE]) {
    return ret;
  }

  return makeUrl(node[PARENT_NODE], params, ret);
};

export const makeUriTemplate = <T extends IController>(node: Node<T>, res: string = ''): string => {
  debug('Entered makeUriPattern with node "%s"', node.name);

  const ret = node.uriTemplate + res;

  if (!node[PARENT_NODE]) {
    return ret;
  }

  return makeUriTemplate(node[PARENT_NODE], ret);
};
