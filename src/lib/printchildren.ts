import { Node } from '../interfaces/ifnode'

export const printChildren = <T>(children: Array<Node<T>>, indent: number = 1): string => {

  let ret = '';

  for (let i = 0; i < children.length; i++) {
    ret = ret + `${children[i].printNode(indent + 1)}`
  }

  return ret;

}
