import {
  IController,
  Node
} from '../interfaces'
import { printChildren } from './index'

export const printNode = <T extends IController>(node: Node<T>, indent: number = 0): string => {

  return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${node.name}
    ${' '.repeat(indent * 4)} || priority=${node.priority}
    ${' '.repeat(indent * 4)} || hasControllers=${node.controllers.length > 0}
    ${' '.repeat(indent * 4)} || children (${node.children.length}) =${printChildren(node.children, indent)}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`
}
