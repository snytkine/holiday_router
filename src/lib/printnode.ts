import { Node } from '../interfaces'
import { printChildren } from './index'

export const printNode = <T>(node: Node<T>, indent: number = 0): string => {

  return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${node.name}
    ${' '.repeat(indent * 4)} || hasController=${!!node.controller}
    ${' '.repeat(indent * 4)} || children (${node.children.length}) =${printChildren(node.children, indent)}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`
}
