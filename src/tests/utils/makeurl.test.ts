import { expect } from 'chai';
import { ExactMatchNode, PathParamNode } from '../../nodes';
import { BasicController, makeUriTemplate, makeUrl, PARENT_NODE } from '../../index';

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

  it('#makeUrl should create url from child node and passed params', () => {
    const res = makeUrl(nodeWithPrefixAndPostfix, { category: 'books', id: '12345' });

    expect(res).to.equal('/books/order-12345.html');
  });

  it('#makeUriTemplate should create original uri template from child node', () => {
    const res = makeUriTemplate(nodeWithPrefixAndPostfix);

    expect(res).to.equal('/{category}/order-{id}.html');
  });
});
