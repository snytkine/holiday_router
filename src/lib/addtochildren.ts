import {
  Node,
  RouteMatchResult,
  UriParams
} from '../interfaces/ifnode'

export const addToChildren = <T>(children: Array<Node<T>>, node: Node<T>): Array<Node<T>> => {

  if (children.find(child => child.equals(node))) {
    throw new Error(`Cannot add node '${node.name}' because equal child node already exists in children array ${JSON.stringify(children)}`);
  }

  return [...children, node].sort((node1, node2) => node1.priority - node2.priority)

}
