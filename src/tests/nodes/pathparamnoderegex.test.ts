import { expect } from 'chai';
import { PathParamNodeRegex, PRIORITY } from '../../nodes';
import { RouterError, RouterErrorCode } from '../../errors';
import { BasicController } from '../../lib';
import { IRouteMatch } from '../../interfaces';

describe('#pathparamnoderegex node', () => {
  describe('#PathParamNode object test', () => {
    it('Created object should be instance of PathParamNodeRegex', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      expect(node).to.be.instanceOf(PathParamNodeRegex);
    });

    it('Created object should be instance of PathParamNodeRegex using empty prefix and postfix', () => {
      const node = new PathParamNodeRegex('item-{id:([0-9]+)}/', 'id', new RegExp('([0-9]+)'));
      expect(node).to.be.instanceOf(PathParamNodeRegex);
    });

    it('PathParamNodeRegex node priority should be greater than PRIORITY.REGEX', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      expect(node.priority).to.be.greaterThan(PRIORITY.REGEX);
    });

    it('2 PathParamNodeRegex nodes should be equal only if they have same postfix, prefix and source', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      const node2 = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      const node3 = new PathParamNodeRegex(
        'item-{id:([a-z0-9]+)}/',
        'id',
        new RegExp('([a-z0-9]+)'),
        '/',
        'item-',
      );

      expect(node.equals(node2)).to.be.true;
      expect(node.equals(node3)).to.be.false;
    });

    it('PathParamNodeRegex match should be true is string matches regex', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      const matched = node.match('1234');
      const notmatched = node.match('abc');
      expect(matched).to.deep.equal(['1234', '1234']);
      expect(notmatched).to.be.false;
    });
  });

  describe('#PathParamNodeRegex makeUri test', () => {
    it('makeUri should create uri from parameters', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      const res = node.makeUri({ id: '12345' });

      expect(res).to.equal('item-12345/');
    });

    it('makeUri should NOT create uri from parameters if required property is missing', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      let res: RouterError;
      try {
        node.makeUri({ item: '12345' });
      } catch (e) {
        res = e;
      }
      expect(res).to.be.instanceOf(RouterError);
      expect(res.code).to.be.equal(RouterErrorCode.MAKE_URI_MISSING_PARAM);
    });

    it('makeUri should NOT create uri from parameters if passed param not matching regex', () => {
      const node = new PathParamNodeRegex(
        'item-{id:([0-9]+)}/',
        'id',
        new RegExp('([0-9]+)'),
        '/',
        'item-',
      );
      let res: RouterError;
      try {
        node.makeUri({ id: 'abc' });
      } catch (e) {
        res = e;
      }
      expect(res).to.be.instanceOf(RouterError);
      expect(res.code).to.be.equal(RouterErrorCode.MAKE_URI_REGEX_FAIL);
    });

    it('.getRouteMatch should return RouteMatch', () => {
      const nodeWithPrefixAndPostfix = new PathParamNodeRegex(
        'order-{id:([0-9]+)}.html',
        'id',
        new RegExp('^([0-9]+)$'),
        '.html',
        'order-',
      );
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      nodeWithPrefixAndPostfix.addController(ctrl);
      nodeWithPrefixAndPostfix.addController(ctrl2);

      const foundRoutes = nodeWithPrefixAndPostfix.getRouteMatch('order-1234.html');

      expect(foundRoutes.node).to.equal(nodeWithPrefixAndPostfix);
      expect(foundRoutes.node.controllers[0]).to.equal(ctrl);
      expect(foundRoutes.params.pathParams[0].paramName).to.equal('id');
      expect(foundRoutes.params.pathParams[0].paramValue).to.equal('1234');
      expect(foundRoutes.node.controllers[1]).to.equal(ctrl2);
    });

    it('.getRouteMatch should return undefined if regex does not match', () => {
      const nodeWithPrefixAndPostfix = new PathParamNodeRegex(
        'order-{id:([0-9]+)}.html',
        'id',
        new RegExp('^([0-9]+)$'),
        '.html',
        'order-',
      );
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      nodeWithPrefixAndPostfix.addController(ctrl);
      nodeWithPrefixAndPostfix.addController(ctrl2);

      const foundRoutes = nodeWithPrefixAndPostfix.getRouteMatch('order-a1.html');

      expect(foundRoutes).to.equal(undefined);
    });

    it('.getRouteMatch should return undefined if prefix does not match', () => {
      const nodeWithPrefixAndPostfix = new PathParamNodeRegex(
        'order-{id:([0-9]+)}.html',
        'id',
        new RegExp('^([0-9]+)$'),
        '.html',
        'order-',
      );
      const ctrl = new BasicController('controller1', 'id1', 2);
      const ctrl2 = new BasicController('controller2', 'id2', 1);
      nodeWithPrefixAndPostfix.addController(ctrl);
      nodeWithPrefixAndPostfix.addController(ctrl2);

      const foundRoutes = nodeWithPrefixAndPostfix.getRouteMatch('orders-123.html');

      expect(foundRoutes).to.equal(undefined);
    });

    it('PathParamNodeRegex with child nodes .getRouteMatch should return RouteMatch from child nodes with all matches', () => {
      const nodeWithPrefixAndPostfix = new PathParamNodeRegex(
        'order-{id:([0-9]+)}/',
        'id',
        new RegExp('^([0-9]+)$'),
        '/',
        'order-',
      );
      const node2 = new PathParamNodeRegex(
        'customer-{name:([a-zA-Z]+)}.html',
        'name',
        new RegExp('([a-zA-Z]+)'),
        '.html',
        'customer-',
      );
      const ctrl = new BasicController('controller1', 'id1', 2);
      node2.addController(ctrl);
      nodeWithPrefixAndPostfix.addChildNode(node2);

      const foundRoutes = <IRouteMatch<BasicController<string>>>nodeWithPrefixAndPostfix.getRouteMatch('order-1234/customer-NICK.html');

      expect(foundRoutes.node).to.equal(node2);

      // @ts-ignore
      expect(foundRoutes.node.controllers[0]).to.equal(ctrl);

      expect(foundRoutes.params.pathParams[0].paramName).to.equal('id');

      expect(foundRoutes.params.pathParams[0].paramValue).to.equal('1234');

      expect(foundRoutes.params.pathParams[1].paramName).to.equal('name');

      expect(foundRoutes.params.pathParams[1].paramValue).to.equal('NICK');
    });

    it('.getRouteMatch on node without controllers should return undefined', () => {
      const nodeWithPrefixAndPostfix = new PathParamNodeRegex(
        'order-{id:([0-9]+)}.html',
        'id',
        new RegExp('^([0-9]+)$'),
        '.html',
        'order-',
      );

      const routeMatch = nodeWithPrefixAndPostfix.getRouteMatch('order-1234.html');

      expect(routeMatch).to.equal(undefined);
    });
  });
});
