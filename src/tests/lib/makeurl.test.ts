import { expect } from 'chai';
import { ExactMatchNode, PathParamNode } from '../../nodes';
import { BasicController, makeUrl, PARENT_NODE } from '../..';

describe('#makeurl test', () => {
  const node0 = new ExactMatchNode('/');
  const node1 = new PathParamNode('category', '/');
  const nodeWithPrefixAndPostfix = new PathParamNode('id', '.html', 'order-');

  nodeWithPrefixAndPostfix.addController(new BasicController('controllerX', 'ctrlX'));
  node1.addChildNode(nodeWithPrefixAndPostfix);
  node0.addChildNode(node1);
  /**
   * Must add PARENT_NODE properties manually
   * because addChildNode does not modify node that is passed as argument
   */
  nodeWithPrefixAndPostfix[PARENT_NODE] = node1;
  node1[PARENT_NODE] = node0;

  it('should create url from child node and passed params', () => {
    const res = makeUrl(nodeWithPrefixAndPostfix, { category: 'books', id: '12345' });

    expect(res).to.equal('/books/order-12345.html');
  });
});
