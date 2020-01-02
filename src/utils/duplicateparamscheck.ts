import Debug from 'debug';
import { IController, Node, PARENT_NODE } from '../interfaces';
import { RouterError, RouterErrorCode } from '../errors';

const debug = Debug('HOLIDAY-ROUTER:lib');

export default function ensureNoDuplicatePathParams<T extends IController>(
  node: Node<T>,
  paramName: string = '',
): boolean {
  debug('Entered ensureNoDuplicatePathParams_ with paramName="%s" node="%o"', paramName, node);

  if (!paramName || !node[PARENT_NODE]) {
    debug('NO paramName or no parent in node "%o"', node);
    return true;
  }

  // @ts-ignore
  if (node[PARENT_NODE].paramName === paramName) {
    // @ts-ignore
    const errorMessage = `URI params must be unique. Non-unique param "${paramName}" found in node=${node[PARENT_NODE].name}`;
    throw new RouterError(errorMessage, RouterErrorCode.NON_UNIQUE_PARAM);
  }

  // @ts-ignore
  return ensureNoDuplicatePathParams(node[PARENT_NODE], paramName);
}
