import {
  IController,
  IStringMap,
  Node
} from '../interfaces'
import Debug from 'debug';
const debug = Debug('GP-URI-ROUTER:lib');

export const makeUrl = <T extends IController>(node: Node<T>, params: IStringMap): string => {

  const _ = (node: Node<T>, params: IStringMap, res: string = '') => {

    if (!node.parentNode) {
      return res;
    }

    res = node.parentNode.makeUri(params) + res;

    return _(node.parentNode, params, res)
  }

  return _(node, params);
}
