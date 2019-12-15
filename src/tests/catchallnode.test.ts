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

    it('#CatchAllNode calling addController method twice should add 2 controllers', () => {
      const node = new CatchAllNode();
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node.addController(ctrl);
      node.addController(ctrl2);

      expect(node.controllers.length)
      .to
      .equal(2)

      expect(node.controllers[0])
      .to
      .equal(ctrl)

      expect(node.controllers[1])
      .to
      .equal(ctrl2)
    })

    it('#CatchAllNode addRoute with empty url should add controller', () => {
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node1.addRoute('', ctrl);
      node1.addRoute('', ctrl2);

      expect(node1.controllers.length)
      .to
      .equal(2)

      expect(node1.controllers[0])
      .to
      .equal(ctrl)

      expect(node1.controllers[1])
      .to
      .equal(ctrl2)
    })

    it('#CatchAllNode findRoutes should return iterator with controller1 and passed uri as value of paramName.', () => {
      const ctrl = new BasicController('controller1')
      const ctrl2 = new BasicController('controller2')
      node2.addRoute('', ctrl);
      node2.addRoute('', ctrl2);
      const routes = node2.findRoutes('/images/recent/small/pic.js');
      const routes2 = node2.findRoutes('/anything/random/path/file.html');
      const aRoutes = Array.from(routes)
      const aRoutes2 = Array.from(routes2)

      expect(aRoutes.length)
      .to
      .equal(2)

      expect(aRoutes[0].controller)
      .to
      .equal(ctrl)

      expect(aRoutes[0].params.pathParams[0].paramName)
      .to
      .equal('images')

      expect(aRoutes[0].params.pathParams[0].paramValue)
      .to
      .equal('/images/recent/small/pic.js')

      /**
       * Second RouteMatch should have different controller
       * but same paramName and paramValue
       */
      expect(aRoutes[1].controller)
      .to
      .equal(ctrl2)

      expect(aRoutes[1].params.pathParams[0].paramName)
      .to
      .equal('images')

      expect(aRoutes[1].params.pathParams[0].paramValue)
      .to
      .equal('/images/recent/small/pic.js')

      /**
       * routes2 iterator should have same controller
       * and same paramName but paramValue should be
       * equal to uri passed in findRoute (a different uri)
       */
      expect(aRoutes2[0].controller)
      .to
      .equal(ctrl)

      expect(aRoutes2[0].params.pathParams[0].paramName)
      .to
      .equal('images')

      expect(aRoutes2[0].params.pathParams[0].paramValue)
      .to
      .equal('/anything/random/path/file.html')

    })


  })
})
