import { PathParamNode } from '../../nodes'
import { ensureNoDuplicatePathParams } from '../../lib'
import { expect } from 'chai';
import { RouterErrorCode } from '../../errors'


describe('#duplicateparamscheck', () => {
  describe('#ensureNoDuplicateParams', () => {
    const node1 = new PathParamNode('person', '/');
    const node2 = new PathParamNode('id', '.html', 'order-');
    const node3 = new PathParamNode('category', '.html', 'order-');

    node1.addChildNode(node2);
    node2.addChildNode(node3);

    it('#Must throw error when any of the parent nodes has same paramName', () => {

      try {
        ensureNoDuplicatePathParams(node3, 'id');
        throw new Error('ensureNoDuplicatePathParams must throw error for non-unique paramName "id"')
      } catch(e){
        expect(e.code).to.equal(RouterErrorCode.NON_UNIQUE_PARAM)
        expect(e.message).to.equal(`URI params must be unique. Non-unique param "id" found in node=PathParamNode::id::'order-'::'.html'`)
      }
    })

    it('#Must throw error when any of the parent nodes has same paramName', () => {

      try {
        ensureNoDuplicatePathParams(node3, 'person');
        throw new Error('ensureNoDuplicatePathParams must throw error for non-unique paramName "id"')
      } catch(e){
        expect(e.code).to.equal(RouterErrorCode.NON_UNIQUE_PARAM)
        expect(e.message).to.equal(`URI params must be unique. Non-unique param "person" found in node=PathParamNode::person::''::'/'`)
      }
    })

    it('#Must not throw if paramName is unique for all parents', () => {
      expect(ensureNoDuplicatePathParams(node3, 'mode')).to.not.throw
    })

  })
})
