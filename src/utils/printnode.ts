import { IController, Node } from '../interfaces';

export const printChildren = <T extends IController>(
  children: Array<Node<T>>,
  indent: number = 1,
): string => {
  let ret = '';

  for (let i = 0; i < children.length; i++) {
    ret += `${printNode(children[i], indent + 1)}`;
  }

  return ret;
};

export const printControllers = <T extends IController>(
  controllers: Array<T>,
  indent: number = 1,
): string => {
  let ret = '';
  if (controllers.length > 0) {
    for (const ctrl of controllers) {
      ret += `
      ${' '.repeat(indent * 4)} * Controller ${ctrl}`;
    }
  }

  return ret;
};

export const printNode = <T extends IController>(node: Node<T>, indent: number = 0): string => {
  return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${node.name}
    ${' '.repeat(indent * 4)} || priority=${node.priority}
    ${' '.repeat(indent * 4)} || Controllers=${node.controllers.length}${printControllers(
    node.controllers,
    indent,
  )}
    ${' '.repeat(indent * 4)} || children (${node.children.length}) ${printChildren(
    node.children,
    indent,
  )}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`;
};
