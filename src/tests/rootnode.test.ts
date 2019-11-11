import {
  ExactMatchNode,
  RootNode
} from '../nodes'
import { expect } from 'chai';


describe('#rootnode.ts', () => {
  describe('#root node object', () => {
    const rootNode = new RootNode();

    it('#Created instance should be a RootNode', () => {
      expect(rootNode)
      .to
      .be
      .instanceOf(RootNode)
    })


    it('#RootNode should have priority 0', () => {
      expect(rootNode.priority)
      .to
      .equal(0)
    })

    it('#RootNode should have name "RootNode"', () => {
      expect(rootNode.name)
      .to
      .equal('RootNode')
    })

    it('#RootNode should .equals should be true if other node is RootNode', () => {

      const isEqual = rootNode.equals(new RootNode())
      expect(isEqual)
        .to
        .be
        .true
    })

    it('#RootNode should .equals should be false if other node is NOT RootNode', () => {

      const isEqual = rootNode.equals(new ExactMatchNode('someurl'))
      expect(isEqual)
        .to
        .be
        .false
    })

    it('#RootNode should have initial empty children array', () => {


      expect(Array.isArray(rootNode.children))
        .to
        .be
        .true

      expect(rootNode.children.length)
      .to
      .equal(0)
    })

    it('#RootNode addController with empty url should add controller', () => {
      const root = new RootNode<string>();
      root.addUriController('', 'rootController');

      expect(root.controller)
      .to
      .equal('rootController')

      expect(root.addUriController('', 'rootController2'))
      .to
      .equal('rootController')

    })


  })
})
