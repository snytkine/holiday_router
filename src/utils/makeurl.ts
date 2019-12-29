import Debug from 'debug';
import { IController, IStringMap, Node, PARENT_NODE } from '../interfaces';

const debug = Debug('GP-URI-ROUTER:lib');

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

  res = node.makeUri(params) + res;

  if (!node[PARENT_NODE]) {
    return res;
  }

  return makeUrl(node[PARENT_NODE], params, res);
};
