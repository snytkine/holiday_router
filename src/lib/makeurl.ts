import {
  IController,
  IStringMap,
  Node,
  PARENT_NODE
} from '../interfaces';
import Debug from 'debug';

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
export const makeUrl = <T extends IController>(node: Node<T>, params: IStringMap, res: string = ''): string => {

  debug('Entered makeUri with node "%s" params="%o"', node.name, params)

  res = node.makeUri(params) + res;

  if (!node[PARENT_NODE]) {
    return res;
  }

  return makeUrl(node[PARENT_NODE], params, res);
}


export const ensureNoDuplicatePathParams = <T extends IController>(node: Node<T>) => {

  debug('Entered ensureNoDuplicatePathParams with node="%o"', node)
  let paramName: string = node.paramName;

  if (!paramName || !node[PARENT_NODE]) {
    debug('no paramName or no parent in node "%o"', node);
    return;
  }

  const _ = (node: Node<T>) => {

    if(!node) return;

    if (node && node.paramName === paramName) {
      throw new Error(`URI params must be unique. Non-unique param "${paramName}" found in node=${node.name}`);
    }

    return _(node[PARENT_NODE]);
  }

  return _(node[PARENT_NODE]);

}


export const ensureNoDuplicatePathParams_ = <T extends IController>(node: Node<T>, paramName: string = '') => {

  debug('Entered ensureNoDuplicatePathParams_ with paramName="%s" node="%o"', paramName, node)

  if (!paramName || !node[PARENT_NODE]) {
    debug('NO paramName or no parent in node "%o"', node);
    return;
  }

  if(node[PARENT_NODE].paramName === paramName){
    throw new Error(`URI params must be unique. Non-unique param "${paramName}" found in node=${node[PARENT_NODE].name}`);
  }

  return ensureNoDuplicatePathParams_(node[PARENT_NODE], paramName)

}
