import {
  ExactMatchNode,
  RootNode
} from '../../nodes'
import { expect } from 'chai';
import {
  getNodePriority,
  PRIORITY
} from '../../nodes/nodepriorities'
import {
  BasicController,
  UniqueController
} from '../../lib'
import { RouterErrorCode } from '../../errors'
import {
  IRouteMatch,
  PARENT_NODE
} from '../../interfaces'
import { TAG } from '../../enums'


describe('#rootnode.ts', () => {
  describe('#RootNode object test', () => {
    const rootNode = new RootNode();

    it('Created instance should be a RootNode', () => {
      expect(rootNode)
      .to
      .be
      .instanceOf(RootNode)
    })


    it('RootNode should have priority of ROOT_NODE', () => {
      expect(rootNode.priority)
      .to
      .equal(getNodePriority(PRIORITY.ROOT))
    })

    it('RootNode should have name "RootNode"', () => {
      expect(rootNode.name)
      .to
      .equal('RootNode')
    })

    it('RootNode should have type TAG.ROOT_NODE', () => {
      expect(rootNode.type)
      .to
      .equal(TAG.ROOT_NODE)
    })

    it('RootNode should have initial empty children array', () => {
      expect(Array.isArray(rootNode.children))
        .to
        .be
        .true

      expect(rootNode.children.length)
      .to
      .equal(0)
    })

    it('.equals should be true if other node is RootNode', () => {
      const isEqual = rootNode.equals(new RootNode())
      expect(isEqual)
        .to
        .be
        .true
    })


    it('.equals should be false if other node is NOT RootNode', () => {

      const isEqual = rootNode.equals(new ExactMatchNode('someurl'))
      expect(isEqual)
        .to
        .be
        .false
    })

/*
    it('.addRoute with empty url should add controller', () => {
      const root = new RootNode();
      const ctrl = new UniqueController('rootController')
      root.addRoute('', ctrl);

      expect(root.controllers[0])
      .to
      .equal(ctrl)
    })*/


    it('.addChildNode should add child node', () => {
      const node = new RootNode();
      node.addChildNode(new ExactMatchNode('mynode'));
      node.addChildNode(new ExactMatchNode('mynode2'));

      expect(node.children.length)
      .to
      .equal(2)

      expect(node.children[0][PARENT_NODE])
      .to
      .equal(node)

      expect(node.children[1][PARENT_NODE])
      .to
      .equal(node)
    })
/*
    it('.addRoute with 2 urls that start with "/" should add just one child node "/"', () => {
      const root = new RootNode();
      const ctrl = new BasicController('controller1', 'ctrl1')
      const ctrl2 = new BasicController('controller1', 'ctrl2')

      root.addRoute('/path1', ctrl);
      root.addRoute('/path2', ctrl2);

      expect(root.children.length)
      .to
      .equal(1)
    })*/


    it('RootNode with no child nodes .findRoute should return undefined', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node.addController(ctrl);
      node.addController(ctrl2);

      const foundRoute = <IRouteMatch<BasicController<string>>>node.findRoute('');

      expect(node.controllers.length)
      .to
      .equal(2)

      expect(foundRoute)
      .to
      .equal(undefined)
    })

/*
    it('.findRoute on node with child nodes should return matching route from child node', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1', 'id1')
      const ctrl2 = new BasicController('controller2', 'id2')
      const ctrl3 = new BasicController('controller3', 'id3')

      node.addRoute('/path1', ctrl)
      node.addRoute('/path1/sub1', ctrl2)
      node.addRoute('/path2', ctrl3)

      const res = <IRouteMatch<BasicController<string>>>node.findRoute('/path1/sub1');

      expect(res.controller)
      .to
      .equal(ctrl2)
    })*/


    it('RootNode with child nodes .findRoutes should return iterator with matches from child node', () => {
      const node = new RootNode();
      const child1 = new ExactMatchNode('/uri1')
      const child2 = new ExactMatchNode('/uri2')

      child1.addController(new BasicController('controller1'));
      child2.addController(new BasicController('controller2', 'id2'));
      /**
       * Set priority of second controller manually to 2 (default is 1) so it will
       * be returned first from iterator
       */
      child2.addController(new BasicController('controller3', 'id3', 2));

      node.addChildNode(child1)
      node.addChildNode(child2)

      const foundRoutes = node.findRoutes('/uri2');
      const aRoutes = Array.from(foundRoutes)

      expect(aRoutes.length)
      .to
      .equal(2)

      expect(aRoutes[0].node)
      .to
      .equal(child2)

      expect(aRoutes[1].node)
      .to
      .equal(child2)

      expect(aRoutes[0].controller.id)
      .to
      .equal('id3')

      expect(aRoutes[1].controller.id)
      .to
      .equal('id2')
    })


    it('RootNode with no child nodes .findRoute should return empty iterator', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node.addController(ctrl);
      node.addController(ctrl2);

      const foundRoutes = node.findRoutes('');

      expect(foundRoutes.next().value)
      .to
      .equal(undefined)

    })

    it('RootNode .findRoutes should return iterator with all matches', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node.addController(ctrl);
      node.addController(ctrl2);

      const foundRoutes = node.findRoutes('');

      expect(foundRoutes.next().value)
      .to
      .equal(undefined)
    })


    it('Calling addController method twice with same controller should throw', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1')
      node.addController(ctrl);

      try {
        node.addController(ctrl);
        throw new Error('RootNode.addController should throw DUPLICATE_CONTROLLER error');
      } catch (e) {
        expect(e.code)
        .to
        .equal(RouterErrorCode.DUPLICATE_CONTROLLER)
      }

    })

    it('.getRouterMatchByControllerId should return matching controller', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1', 'id1')
      const ctrl2 = new BasicController('controller2', 'id2')
      const ctrl3 = new BasicController('controller3', 'id3')

      node.addController(ctrl)
      node.addController(ctrl2)
      node.addController(ctrl3)

      const res = <IRouteMatch<BasicController<string>>>node.getRouterMatchByControllerId('id2');

      expect(res.node)
      .to
      .equal(node)

      expect(res.controller)
      .to
      .equal(ctrl2)

    })


    it('.makeUri should return empty string', () => {
      const uri = rootNode.makeUri({ 'images': '/documents/files/file1.png' });

      expect(uri)
      .to
      .equal('')
    })


    it('.getAllControllers should return iterator with all controllers', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')

      node.addController(ctrl);
      node.addController(ctrl2);

      const res = node.getAllControllers()

      expect(res.next().value.controller)
      .to
      .equal(ctrl)

      expect(res.next().value.controller)
      .to
      .equal(ctrl2)

      expect(res.next().value)
      .to
      .equal(undefined)
    })

/*
    it('.getRouterMatchByControllerId on node with child nodes should return matching controller from child node', () => {
      const node = new RootNode();
      const ctrl = new BasicController('controller1', 'id1')
      const ctrl2 = new BasicController('controller2', 'id2')
      const ctrl3 = new BasicController('controller3', 'id3')

      node.addRoute('/path1', ctrl)
      node.addRoute('/path1/sub1', ctrl2)
      node.addRoute('/path2', ctrl3)

      const res = <IRouteMatch<BasicController<string>>>node.getRouterMatchByControllerId('id2');

      expect(res.controller)
      .to
      .equal(ctrl2)

    })*/


  })
})
