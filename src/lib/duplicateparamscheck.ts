import {
  IController,
  Node,
  PARENT_NODE
} from '../interfaces'
import Debug from 'debug';
import {
  RouterError,
  RouterErrorCode
} from '../errors'

const debug = Debug('GP-URI-ROUTER:lib');

export const ensureNoDuplicatePathParams = <T extends IController>(node: Node<T>, paramName: string = '') => {

  debug('Entered ensureNoDuplicatePathParams_ with paramName="%s" node="%o"', paramName, node)

  if (!paramName || !node[PARENT_NODE]) {
    debug('NO paramName or no parent in node "%o"', node);
    return;
  }

  if (node[PARENT_NODE].paramName === paramName) {
    const errorMessage = `URI params must be unique. Non-unique param "${paramName}" found in node=${node[PARENT_NODE].name}`;
    throw new RouterError(errorMessage, RouterErrorCode.NON_UNIQUE_PARAM);
  }

  return ensureNoDuplicatePathParams(node[PARENT_NODE], paramName)
}
