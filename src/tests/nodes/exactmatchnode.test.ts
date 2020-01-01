import { expect } from 'chai';
import { ExactMatchNode, getNodePriority, PathParamNode, PRIORITY } from '../../nodes';
import TAG from '../../enums/nodetags';
import { IRouteMatch } from '../../interfaces';
import { BasicController } from '../../lib';
import { RouterError, RouterErrorCode } from '../../errors';

describe('#ExactMatchNode.ts', () => {
  describe('#ExactMatchNode object test', () => {
    const node1 = new ExactMatchNode('path1/');

    it('Created instance should be an instance of ExactMatchNode', () => {
      expect(node1).to.be.instanceOf(ExactMatchNode);
    });

    it('ExactMatchNode should have priority of PRIORITY.EXACTMATCH', () => {
      expect(node1.priority).to.equal(getNodePriority(PRIORITY.EXACTMATCH));
    });

    it('ExactMatchNode should have name type TAG.CATCHALL_NODE', () => {
      expect(node1.type).to.equal(TAG.EXACTMATCH_NODE);
    });

    it('ExactMatchNode should have name CATCH_ALL_PARAM_NAME', () => {
      expect(node1.name).to.equal(`${TAG.EXACTMATCH_NODE}::path1/`);
    });

    it('equals should be true if other node is ExactMatchNode with same uri', () => {
      expect(node1.equals(new ExactMatchNode('path1/'))).to.equal(true);
    });

    it('equals should be false if other node is ExactMatchNode with different uri', () => {
      expect(node1.equals(new PathParamNode('path1'))).to.equal(false);
    });

    it('equals should be false if other node is NOT ExactMatchNode with same uri', () => {
      expect(node1.equals(new PathParamNode('path1'))).to.equal(false);
    });

    it('.getAllRoutes should return iterator with all controllers', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);

      node.addController(ctrl);
      node.addController(ctrl2);

      const res = node.getAllRoutes();
      const { controllers } = res.next().value.node;

      expect(controllers[0]).to.equal(ctrl);
      expect(controllers[1]).to.equal(ctrl2);
      expect(res.next().value).to.equal(undefined);
    });

    it('.makeUri should return value of this node origUriPattern', () => {
      const uri = node1.makeUri({ param1: 'value1' });

      expect(uri).to.equal('path1/');
    });

    it('.getRouteMatchByControllerId should return matching RouteMatch', () => {
      const node = new ExactMatchNode('path1/');
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
      const node = new ExactMatchNode('path1/');
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

    it('.getRouteMatch should return iterator with all matches', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const routeMatch = node.getRouteMatch('path1/');

      expect(routeMatch.node).to.equal(node);
      expect(routeMatch.node.controllers[0]).to.equal(ctrl);
      expect(routeMatch.node.controllers[1]).to.equal(ctrl2);
    });

    it('.getRouteMatch should return first match', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const routeMatch = <IRouteMatch<BasicController<string>>>node.getRouteMatch('path1/');

      expect(routeMatch.node).to.equal(node);

      expect(routeMatch.node.controllers[0]).to.equal(ctrl);
    });

    it('.getRouteMatch with different URI should return undefined', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const routeMatch = node.getRouteMatch('path1');

      expect(routeMatch).to.equal(undefined);
    });

    it('.getRouteMatch on node without controllers should return undefined', () => {
      const node = new ExactMatchNode('path1/');

      const routeMatch = node.getRouteMatch('path1/');

      expect(routeMatch).to.equal(undefined);
    });

    it('.addChildNode should add child node', () => {
      const node = new ExactMatchNode('path1/');
      node.addChildNode(new ExactMatchNode('mynode'));
      node.addChildNode(new ExactMatchNode('mynode2'));

      expect(node.children.length).to.equal(2);
    });
  });
});
