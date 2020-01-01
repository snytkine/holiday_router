import { expect } from 'chai';
import { BasicController, ExtractedPathParam, RouteMatch } from '../../lib';
import { ExactMatchNode } from '../../nodes';

describe('#RouteMatch object test', () => {
  const pathParam1 = new ExtractedPathParam('param1', 'param1value');
  const pathParam2 = new ExtractedPathParam('param2', 'param2value');
  const uriParams = { pathParams: [pathParam1, pathParam2] };
  const node = new ExactMatchNode('path1');
  const controller = new BasicController<string>('CTRL1', 'CTRL1');
  node.addController(controller);

  it('#Should create new instance of RouteMatch', () => {
    const res = new RouteMatch(node, uriParams);
    expect(res.node.controllers[0]).to.equal(controller);
    expect(res.node).to.equal(node);
    expect(res.params).to.equal(uriParams);
  });

  it('#toString returns formatted string', () => {
    const routeMatch = new RouteMatch(node, uriParams);
    const res = routeMatch.toString();
    expect(res).to.equal(
      `RouteMatch node=ExactMathNode::path1 controllers=[{"priority":1,"controller":"CTRL1","id":"CTRL1"}] params={"pathParams":[{"paramName":"param1","paramValue":"param1value"},{"paramName":"param2","paramValue":"param2value"}]}`,
    );
  });
});
