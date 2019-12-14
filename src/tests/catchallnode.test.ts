import {
  CatchAllNode,
  ExactMatchNode,
  RootNode
} from '../nodes'
import { expect } from 'chai';
import {
  getNodePriority,
  PRIORITY
} from '../nodes/nodepriorities'
import { BasicController } from '../lib'
import { CATCH_ALL_PARAM_NAME } from '../interfaces'
import { TAG } from '../enums'


describe('#CatchAllNode.ts', () => {
  describe('#CatchAllNode object', () => {
    const node1 = new CatchAllNode();
    /**
     * CatchAllNode with custom name
     */
    const node2 = new CatchAllNode('images')

    it('#Created instance should be an instance of RootNode', () => {
      expect(node1)
      .to
      .be
      .instanceOf(RootNode)
    })

    it('#Created instance should be an instance of  CatchAllNode', () => {
      expect(node1)
      .to
      .be
      .instanceOf(CatchAllNode)
    })


    it('#CatchAllNode should have priority of ROOT_NODE', () => {
      expect(node1.priority)
      .to
      .equal(getNodePriority(PRIORITY.CATCHALL))
    })

    it('#CatchAll node should have name CATCH_ALL_PARAM_NAME', () => {
      expect(node1.name)
      .to
      .equal(`${TAG.CATCHALL_NODE}::${CATCH_ALL_PARAM_NAME}`)
    })

    it('#CatchAll named node should have name passed in constructor', () => {
      expect(node2.name)
      .to
      .equal(`${TAG.CATCHALL_NODE}::images`)
    })

    it('#CatchAllNode .equals should be true if other node is CatchAllNode', () => {

      const isEqual = node1.equals(node2)
      expect(isEqual)
        .to
        .be
        .true
    })

    it('#CatchAllNode .equals should be false if other node is NOT CatchAllNode', () => {

      const isEqual = node1.equals(new ExactMatchNode('someurl'))
      expect(isEqual)
        .to
        .be
        .false
    })

    it('#CatchAllNode should have initial empty children array', () => {
      expect(Array.isArray(node1.children))
        .to
        .be
        .true

      expect(node1.children.length)
      .to
      .equal(0)
    })

    it('#CatchAllNode addController with empty url should add controller', () => {
      const ctrl = new BasicController('controller1')
      node1.addRoute('', ctrl);

      expect(node1.controllers[0])
      .to
      .equal(ctrl)
    })

    it('#CatchAllNode findRoutes should return iterator with controller1 and passed uri as value of paramName')
    const ctrl = new BasicController('controller1')
    node2.addRoute('', ctrl);
    const routes = node2.findRoutes('/images/recent/small/pic.js');
    const aRoutes = []
    //const route1 = routes.next();
    for (const res of routes) {
      aRoutes.push(res);
    }

    console.dir(aRoutes[0]);

    expect(aRoutes[0].controller)
    .to
    .equal(ctrl)

    routes.return(true)

  })
})
