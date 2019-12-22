import { expect } from 'chai'
import {
  PathParamNodeRegex,
  PRIORITY
} from '../../nodes'
import {
  RouterError,
  RouterErrorCode
} from '../../errors'

describe('#pathparamnoderegex node', () => {
  describe('#PathParamNode object test', () => {

    it('Created object should be instance of PathParamNodeRegex', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      expect(node)
      .to
      .be
      .instanceOf(PathParamNodeRegex)
    })

    it('PathParamNodeRegex node priority should be greated than PRIORITY.REGEX', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      expect(node.priority)
      .to
      .be
      .greaterThan(PRIORITY.REGEX)
    })

    it('2 PathParamNodeRegex nodes should be equal only if they have same postfix, prefix and source', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      const node2 = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      const node3 = new PathParamNodeRegex('id', new RegExp('([a-z0-9]+)'), '/', 'item-');

      expect(node.equals(node2)).to.be.true;
      expect(node.equals(node3)).to.be.false;
    })

    it('PathParamNodeRegex match should be true is string matches regex', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      const matched = Reflect.apply(node['match'], node, ['1234'])
      const notmatched = Reflect.apply(node['match'], node, ['abc'])
      expect(matched).to.deep.equal(["1234","1234"]);
      expect(notmatched).to.be.false;

    })
  })

  describe('#PathParamNodeRegex makeUri test', () => {
    it('makeUri should create uri from parameters', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      const res = node.makeUri({id:'12345'})

      expect(res).to.equal('item-12345/')
    })

    it('makeUri should NOT create uri from parameters if required property is missing', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      try{
        const res = node.makeUri({item:'12345'})
        throw new Error('makeUri should throw exception because property "id" is not passed')
      } catch(e){
        expect(e).to.be.instanceOf(RouterError)
        expect(e.code).to.be.equal(RouterErrorCode.MAKE_URI_MISSING_PARAM)
      }
    })

    it('makeUri should NOT create uri from parameters if passed param not matching regex', () => {
      const node = new PathParamNodeRegex('id', new RegExp('([0-9]+)'), '/', 'item-');
      try{
        const res = node.makeUri({id:'abc'})
        throw new Error('makeUri should throw exception because property "id" is not passed')
      } catch(e){
        expect(e).to.be.instanceOf(RouterError)
        expect(e.code).to.be.equal(RouterErrorCode.MAKE_URI_REGEX_FAIL)
      }
    })
  })
})
