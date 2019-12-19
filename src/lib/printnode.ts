import {
  IController,
  Node
} from '../interfaces'
import { printChildren } from './index'
import { SYM_CONTROLLER_URI } from '../interfaces'


export const printControllers = <T extends IController>(controllers: Array<T>, indent: number = 1): string => {
  let ret = '';
  if (controllers.length > 0) {
    for (const ctrl of controllers) {
      ret = ret + `
    ${' '.repeat(indent * 4)} + ${ctrl.id} uri=${ctrl[SYM_CONTROLLER_URI]}`
    }
  }

  return ret;
}

export const printNode = <T extends IController>(node: Node<T>, indent: number = 0): string => {

  return `
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}
    ${' '.repeat(indent * 4)} || node=${node.name}
    ${' '.repeat(indent * 4)} || priority=${node.priority}
    ${' '.repeat(indent * 4)} || hasControllers=${node.controllers.length || 'NO'}${printControllers(node.controllers, indent)}
    ${' '.repeat(indent * 4)} || children (${node.children.length}) =${printChildren(node.children, indent)}
    ${' '.repeat(indent * 4)} || ${'='.repeat(36)}`
}
