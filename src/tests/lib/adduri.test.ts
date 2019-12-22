import { expect } from 'chai';
import {
  CatchAllNode,
  ExactMatchNode,
  PathParamNode
} from '../../nodes'
import { CATCH_ALL_PARAM_NAME } from '../../interfaces'
import {
  makeCatchAllNode,
  makeExactMatchNode,
  makeNode,
  makePathParamNode,
  makePathParamNodeRegex
} from '../../lib'
import { TAG } from '../../enums'

describe('#adduri.ts', () => {
  describe('#makeExactMatchNode', () => {
    it('should create ExactMatch node if string passed in constructor is NOT same as CATCH_ALL_PARAM_NAME', () => {
      const res = makeExactMatchNode('path1');
      expect(res)
      .to
      .be
      .instanceOf(ExactMatchNode);
    })

    it('should return null if string passed in constructor is same as CATCH_ALL_PARAM_NAME', () => {
      const res = makeExactMatchNode(CATCH_ALL_PARAM_NAME);
      expect(res).to.be.null;
    })
  })

  describe('#makeCatchAllNode', () => {
    it('should create CatchAllNode if passed argument is CATCH_ALL_PARAM_NAME', () => {
      const res = makeCatchAllNode(CATCH_ALL_PARAM_NAME);
      expect(res)
      .to
      .be
      .instanceOf(CatchAllNode);
    })

    it('should create CatchAllNode if passed argument matches pattern of named CatchAllNode', () => {
      const res = makeCatchAllNode('{*images-DIR_2019-01-02}');
      expect(res)
      .to
      .be
      .instanceOf(CatchAllNode);
    })

    it('should return null if passed argument matches pattern of named CatchAllNode', () => {
      const res = makeCatchAllNode('{images-DIR_2019-01-02}');
      expect(res).to.be.null;
    })
  })

  describe('#makePathParamNode', () => {
    it('should create PathParamNode without prefix and postfix', () => {
      const res = makePathParamNode('{catalog}')
      expect(res.type)
      .to
      .be
      .equal(TAG.PATHPARAM_NODE)
      expect(res.paramName)
      .to
      .equal('catalog')
      expect(res.name)
      .to
      .be
      .equal(`PathParamNode::catalog::''::''`)
    })

    it('should create PathParamNode with prefix and postfix', () => {
      const res = makePathParamNode('widget-{id}.html')
      expect(res.type)
      .to
      .be
      .equal(TAG.PATHPARAM_NODE)
      expect(res.paramName)
      .to
      .equal('id')
      expect(res.name)
      .to
      .be
      .equal(`PathParamNode::id::'widget-'::'.html'`)
    })

    it('should create PathParamNode with prefix and postfix with spaces before after param name', () => {
      const res = makePathParamNode('widget-{ id }.html')
      expect(res.type)
      .to
      .be
      .equal(TAG.PATHPARAM_NODE)
      expect(res.paramName)
      .to
      .equal('id')
      expect(res.name)
      .to
      .be
      .equal(`PathParamNode::id::'widget-'::'.html'`)
    })

    it('should return null if passed uriSegment is not matching expected regexp pattern', () => {
      const res = makePathParamNode('widget')
      expect(res).to.be.null;
    })

  })


  describe('#mathPathParamNodeRegex', () => {
    it('should create PathParamNodeRegex without prefix and postfix when passed uriSeegment is matching a valid regex', () => {
      const res = makePathParamNodeRegex('{year:([0-9]{4})}');

      console.log(res.regex.source)
      expect(res.type)
      .to
      .be
      .equal(TAG.PATHPARAM_REGEX_NODE);
      expect(res.paramName)
      .to
      .be
      .equal('year');
      expect(res.regex)
      .to
      .be
      .instanceOf(RegExp);

      /**
       * Make sure it generated RegExp that we expected
       * must match 4 digits
       *
       * and NOT match something else
       */
      const reRes = res.regex.exec('1234');
      const reRes2 = res.regex.exec('123');

      expect(reRes && reRes[1])
      .to
      .equal('1234');

      expect(reRes2).to.be.null;
    })

    it('should create PathParamNodeRegex with prefix and postfix when passed uriSegment is matching a valid regex', () => {
      const res = makePathParamNodeRegex('model-{year:([0-9]{4})}-current.html');
      expect(res.name)
      .to
      .equal(`PathParamNodeRegex::'year'::'^([0-9]{4})$'::'model-'::'-current.html'`)
    })

    it('should NOT create Node if segment is NOT valid', () => {
      const res = makePathParamNodeRegex('year:([0-9]{4})');
      expect(res).to.be.null;
    })

    it('should NOT create Node if segment is a valid but regex part of segment is NOT valid', () => {

      try {
        makePathParamNodeRegex('{year:[0-9]{4})}');
        throw new Error('makePathParamNodeRegex expected to throw SyntaxError when invalid regex literal is passed');
      } catch (e) {
        expect(e)
        .to
        .be
        .instanceOf(SyntaxError)
      }
    })
  })

  describe('#makeNode test', () => {
    it('should create PathParamNode', () => {
      const res = makeNode('invoice-{id}.html');
      expect(res)
      .to
      .be
      .instanceOf(PathParamNode);

      expect(res.name).to.equal(`PathParamNode::id::'invoice-'::'.html'`);
    })
  })

})
