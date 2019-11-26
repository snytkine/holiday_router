import {
  IController,
  Node
} from '../interfaces'
import { printNode } from './printnode'

export const printChildren = <T extends IController>(children: Array<Node<T>>, indent: number = 1): string => {

  let ret = '';

  for (let i = 0; i < children.length; i++) {
    ret = ret + `${printNode(children[i], indent + 1)}`
  }

  return ret;
}
