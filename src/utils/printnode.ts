import { IControllerContainer, Node } from '../interfaces';

const printNode = <T extends IControllerContainer>(node: Node<T>, indent: number = 0): string => {
  const printControllers = <T extends IControllerContainer>(controllers: Array<T> = []): string => {
    return controllers.reduce((acc, ctrl) => {
      return `${acc}\n${' '.repeat(6)}${' '.repeat(indent * 4)} * Controller ${ctrl}`;
    }, '');
  };

  const printChildren = <T extends IControllerContainer>(children: Array<Node<T>>): string => {
    return children.reduce((acc, child) => `${acc}${printNode(child, indent + 1)}`, '');
  };

  return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${node.name}
    ${' '.repeat(indent * 4)} || priority=${node.priority}
    ${' '.repeat(indent * 4)} || Controllers=${(node.controllers && node.controllers.length) ||
    0}${printControllers(node.controllers)}
    ${' '.repeat(indent * 4)} || children (${node.children.length}) ${printChildren(node.children)}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`;
};

export default printNode;
