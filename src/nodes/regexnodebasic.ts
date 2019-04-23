import { Node } from '../interfaces/ifnode'
import {
  RouteMatchResult,
  UriParams
} from '../interfaces'


export class RegexNodeBasic<T> implements Node<T> {
  priority: number
  name: string
  children: Array<Node<T>>

  constructor(public paramName: string, public readonly re: RegExp,
              public readonly pathSeparator?: string | undefined) {

  }

  equals(other: Node<T>): boolean {
    return undefined
  }


  findRoute(uri: string, params?: UriParams): RouteMatchResult<T> {

    let rest: string;
    let pathSeparatorPos: number;

    let s = (!!this.pathSeparator) ? uri.substring(0, uri.indexOf(this.pathSeparator)) : uri;


    return undefined
  }

  addChild(node: Node<T>): void {
  }

}
