import { expect } from 'chai';
import { ExactMatchNode, getNodePriority, PathParamNode, PRIORITY } from '../../nodes';
import { TAG } from '../../enums';
import { IRouteMatch } from '../../interfaces';
import { BasicController } from '../../lib';
import { RouterErrorCode } from '../../errors';

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

      expect(res.next().value.controller).to.equal(ctrl);

      expect(res.next().value.controller).to.equal(ctrl2);

      expect(res.next().value).to.equal(undefined);
    });

    it('.makeUri should return value of this node origUriPattern', () => {
      const uri = node1.makeUri({ param1: 'value1' });

      expect(uri).to.equal('path1/');
    });

    it('.getRouteMatchByControllerId should return matching controller', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1');
      const ctrl2 = new BasicController('controller2', 'id2');
      const ctrl3 = new BasicController('controller3', 'id3');

      node.addController(ctrl);
      node.addController(ctrl2);
      node.addController(ctrl3);

      const res = <IRouteMatch<BasicController<string>>>node.getRouteMatchByControllerId('id2');

      expect(res.node).to.equal(node);

      expect(res.controller).to.equal(ctrl2);
    });

    it('Calling addController method twice with same controller should throw', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1');
      node.addController(ctrl);

      try {
        node.addController(ctrl);
        throw new Error('RootNode.addController should throw DUPLICATE_CONTROLLER error');
      } catch (e) {
        expect(e.code).to.equal(RouterErrorCode.DUPLICATE_CONTROLLER);
      }
    });

    it('.findRoutes should return iterator with all matches', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const foundRoutes = node.findRoutes('path1/');

      const route1 = foundRoutes.next();
      const route2 = foundRoutes.next();

      expect(route1.value.node).to.equal(node);

      expect(route1.value.controller).to.equal(ctrl);

      expect(route2.value.node).to.equal(node);

      expect(route2.value.controller).to.equal(ctrl2);
    });

    it('.findRoute should return first match', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const route = <IRouteMatch<BasicController<string>>>node.findRoute('path1/');

      expect(route.node).to.equal(node);

      expect(route.controller).to.equal(ctrl);
    });

    it('.findRoute with different URI should return undefined', () => {
      const node = new ExactMatchNode('path1/');
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      node.addController(ctrl);
      node.addController(ctrl2);

      const route = node.findRoute('path1');

      expect(route).to.equal(undefined);
    });

    it('.addChildNode should add child node', () => {
      const node = new ExactMatchNode('path1/');
      node.addChildNode(new ExactMatchNode('mynode'));
      node.addChildNode(new ExactMatchNode('mynode2'));

      expect(node.children.length).to.equal(2);
    });
  });
});
