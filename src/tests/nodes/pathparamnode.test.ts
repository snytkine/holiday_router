import { expect } from 'chai';
import TAG from '../../enums/nodetags';
import { ExactMatchNode, getNodePriority, PathParamNode, PRIORITY } from '../../nodes';
import { IRouteMatch } from '../../interfaces';
import { BasicController } from '../../lib';
import { RouterError, RouterErrorCode } from '../../errors';

describe('#pathparamnode.ts', () => {
  describe('#PathParamNode object test', () => {
    const node1 = new PathParamNode('id');
    const nodeWithPrefixAndPostfix = new PathParamNode('id', '.html', 'order-');

    it('Created instance should be an instance of PathParamNode', () => {
      expect(node1).to.be.instanceOf(PathParamNode);

      expect(nodeWithPrefixAndPostfix).to.be.instanceOf(PathParamNode);
    });

    it('PathParamNode should have priority of PRIORITY.PATHPARAM', () => {
      expect(node1.priority).to.equal(getNodePriority(PRIORITY.PATHPARAM));

      expect(nodeWithPrefixAndPostfix.priority).to.be.greaterThan(
        getNodePriority(PRIORITY.PATHPARAM),
      );
    });

    it('PathParamNode with longer prefix and postfix should have higher priority', () => {
      expect(nodeWithPrefixAndPostfix.priority).to.be.greaterThan(node1.priority);
    });

    it('PathParamNode should have name type TAG.PATHPARAM_NODE', () => {
      expect(node1.type).to.equal(TAG.PATHPARAM_NODE);

      expect(nodeWithPrefixAndPostfix.type).to.equal(TAG.PATHPARAM_NODE);
    });

    it('equals for node with no prefix and no postfix should be true if other node is PathParamNode', () => {
      expect(node1.equals(new PathParamNode('var1'))).to.equal(true);
    });

    it('equals for node with prefix and postfix should be true if other node is PathParamNode with same prefix and postfix', () => {
      expect(
        nodeWithPrefixAndPostfix.equals(new PathParamNode('var1', '.html', 'order-')),
      ).to.equal(true);
    });

    it('equals for node with prefix and postfix should be false if other node is PathParamNode with same postfix and different prefix', () => {
      expect(node1.equals(new PathParamNode('var1', '.html'))).to.equal(false);
    });

    it('equals for node with no prefix and no postfix should be false if other node is NOT PathParamNode', () => {
      expect(node1.equals(new ExactMatchNode('var1'))).to.equal(false);
    });

    it('.addChildNode should add child node', () => {
      const node = new PathParamNode('var1');
      node.addChildNode(new ExactMatchNode('mynode'));
      node.addChildNode(new ExactMatchNode('mynode2'));

      expect(node.children.length).to.equal(2);
    });

    it('.getAllRoutes should return iterator with all controllers', () => {
      const node = new PathParamNode('var1');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);

      node.addController(ctrl);
      node.addController(ctrl2);

      const res = node.getAllRoutes();
      const { controllers } = res[0].node;

      expect(controllers[0]).to.equal(ctrl);
      expect(controllers[1]).to.equal(ctrl2);
      expect(res[1]).to.equal(undefined);
    });

    it('.getRouteMatchByControllerId should return matching RouteMatch', () => {
      const node = new PathParamNode('var1');
      const ctrl = new BasicController('controller1', 'id1');
      const ctrl2 = new BasicController('controller2', 'id2');
      const ctrl3 = new BasicController('controller3', 'id3');

      node.addController(ctrl);
      node.addController(ctrl2);
      node.addController(ctrl3);

      const res = <IRouteMatch<BasicController<string>>>node.getRouteMatchByControllerId('id2');

      expect(res.node).to.equal(node);
      expect(res.node.controllers).to.include(ctrl2);
    });

    it('Calling addController method twice with same controller should throw', () => {
      const node = new PathParamNode('var1');
      const ctrl = new BasicController('controller1');
      node.addController(ctrl);
      let res: RouterError;
      try {
        node.addController(ctrl);
      } catch (e) {
        res = e;
      }
      expect(res.code).to.equal(RouterErrorCode.DUPLICATE_CONTROLLER);
    });

    it('.makeUri on node without prefix and postfix should return value of this node param', () => {
      const uri = node1.makeUri({
        param1: 'value1',
        id: '1234',
      });

      expect(uri).to.equal('1234');
    });

    it('.makeUri on node with prefix and postfix should return value of this node param', () => {
      const uri = nodeWithPrefixAndPostfix.makeUri({
        param1: 'value1',
        id: '1234',
      });

      expect(uri).to.equal('order-1234.html');
    });

    it('.makeUri on node without supplying param property should throw', () => {
      let res: RouterError;
      try {
        nodeWithPrefixAndPostfix.makeUri({
          param1: 'value1',
          order: '1234',
        });
      } catch (e) {
        res = e;
      }
      expect(res.code).to.equal(RouterErrorCode.MAKE_URI_MISSING_PARAM);
    });

    it('.getRouteMatch should return iterator with all matches', () => {
      const myNode = new PathParamNode('id', '.html', 'order-');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      myNode.addController(ctrl);
      myNode.addController(ctrl2);

      const foundRoutes = myNode.getRouteMatch('order-1234.html');

      expect(foundRoutes.node).to.equal(myNode);
      expect(foundRoutes.node.controllers[0]).to.equal(ctrl);
      expect(foundRoutes.params.pathParams[0].paramName).to.equal('id');
      expect(foundRoutes.params.pathParams[0].paramValue).to.equal('1234');
      expect(foundRoutes.node.controllers[1]).to.equal(ctrl2);
    });

    it('.getRouteMatch called with non-matching uri should return undefined', () => {
      const myNode = new PathParamNode('id', '.html', 'order-');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      myNode.addController(ctrl);
      myNode.addController(ctrl2);

      const foundRoutes = myNode.getRouteMatch('1234.html');

      expect(foundRoutes).to.equal(undefined);
    });

    it('.getRouteMatch should return RouteMatch with highest priority controller first', () => {
      const myNode = new PathParamNode('id', '.html', 'order-');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      myNode.addController(ctrl2);
      myNode.addController(ctrl);

      const routeMatch = <IRouteMatch<BasicController<string>>>(
        myNode.getRouteMatch('order-1234.html')
      );

      expect(routeMatch.node).to.equal(myNode);

      expect(routeMatch.node.controllers[0]).to.equal(ctrl);
    });

    it('.getRouteMatch with non-matching uri should return undefined', () => {
      const myNode = new PathParamNode('id', '.html', 'order-');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      myNode.addController(ctrl2);
      myNode.addController(ctrl);

      const routeMatch = myNode.getRouteMatch('1234.html');

      expect(routeMatch).to.equal(undefined);
    });

    it('.getRouteMatch on node without controllers should return undefined', () => {
      const myNode = new PathParamNode('id', '.html', 'order-');

      const routeMatch = myNode.getRouteMatch('order-1234.html');

      expect(routeMatch).to.equal(undefined);
    });
  });

  describe('#PathParamNode with child nodes test', () => {
    const node1 = new PathParamNode('category', '/');
    const nodeWithPrefixAndPostfix = new PathParamNode('id', '.html', 'order-');

    nodeWithPrefixAndPostfix.addController(new BasicController('controllerX', 'ctrlX'));
    node1.addChildNode(nodeWithPrefixAndPostfix);

    it('findRoute should extract pathParams from url and find from child node', () => {
      const routeMatch = <IRouteMatch<BasicController<string>>>(
        node1.getRouteMatch('books/order-1234.html')
      );

      expect(routeMatch.node).to.equal(nodeWithPrefixAndPostfix);

      expect(routeMatch.node.controllers[0].id).to.equal('ctrlX');

      expect(routeMatch.params.pathParams).to.deep.include({
        paramName: 'id',
        paramValue: '1234',
      });

      expect(routeMatch.params.pathParams).to.deep.include({
        paramName: 'category',
        paramValue: 'books',
      });
    });
  });
});
